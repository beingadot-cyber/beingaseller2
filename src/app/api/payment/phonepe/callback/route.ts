import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { phonepeConfigured, sha256hex, PHONEPE_CONFIG } from "@/lib/phonepe";

export const runtime = "nodejs";

/**
 * POST /api/payment/phonepe/callback
 *
 * Server-to-server webhook invoked by PhonePe after the payment attempt.
 * Payload: { response: "<base64>" } with X-VERIFY signature header.
 * Responds 200 in all cases so PhonePe does not retry indefinitely;
 * mismatched/invalid payloads are logged and ignored.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const base64Response: string = body?.response ?? "";
    const headerVerify = req.headers.get("x-verify") ?? "";

    if (!base64Response) {
      return NextResponse.json({ received: true });
    }

    // Verify signature: sha256(base64Response + saltKey) + "###" + saltIndex
    if (phonepeConfigured()) {
      const expected =
        sha256hex(base64Response + PHONEPE_CONFIG.saltKey) +
        "###" +
        PHONEPE_CONFIG.saltIndex;
      if (headerVerify && headerVerify !== expected) {
        console.warn("[phonepe callback] checksum mismatch — ignoring");
        return NextResponse.json({ received: true });
      }
    }

    const decoded = JSON.parse(
      Buffer.from(base64Response, "base64").toString("utf-8")
    );

    const merchantTransactionId: string | undefined =
      decoded?.data?.merchantTransactionId;
    const code: string = decoded?.code ?? "";

    if (!merchantTransactionId) {
      return NextResponse.json({ received: true });
    }

    const status =
      code === "PAYMENT_SUCCESS"
        ? "PAID"
        : code === "PAYMENT_PENDING"
          ? "PENDING"
          : "FAILED";

    await db
      .update(orders)
      .set({
        status,
        providerCode: code || null,
        phonepeTxnId: decoded?.data?.transactionId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, merchantTransactionId));

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[phonepe callback] error:", err);
    return NextResponse.json({ received: true });
  }
}
