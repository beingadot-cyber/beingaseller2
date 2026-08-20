import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import {
  appBaseUrl,
  phonepeBaseUrl,
  phonepeConfigured,
  sha256hex,
  PHONEPE_CONFIG,
} from "@/lib/phonepe";

export const runtime = "nodejs";

/**
 * POST /api/payment/phonepe  { orderId }
 *
 * Initiates a PhonePe Pay Page payment.
 *  - Live mode: encodes the payload, signs it, calls PhonePe and returns
 *    the hosted checkout URL for the client to redirect to.
 *  - Demo mode (no credentials in env): returns a local simulation URL so
 *    the full flow can be tested without a merchant account.
 */
export async function POST(req: Request) {
  let orderId = "";
  try {
    const body = await req.json();
    orderId = String(body.orderId ?? "");
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }
  if (!orderId) {
    return NextResponse.json({ ok: false, message: "orderId is required." }, { status: 400 });
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.json({ ok: false, message: "Order not found." }, { status: 404 });
  }
  if (order.status === "PAID") {
    return NextResponse.json({ ok: false, message: "Order already paid." }, { status: 409 });
  }

  const base = appBaseUrl(req);

  /* ── Demo mode: no credentials configured yet ────────────── */
  if (!phonepeConfigured()) {
    await db
      .update(orders)
      .set({ demo: true, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return NextResponse.json({
      ok: true,
      mode: "demo",
      url: `${base}/checkout/status?orderId=${orderId}&demo=1`,
      message:
        "PhonePe credentials not configured — running in demo simulation. Add PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY and PHONEPE_SALT_INDEX to go live.",
    });
  }

  /* ── Live mode: PhonePe Pay Page ─────────────────────────── */
  const redirectUrl = `${base}/checkout/status?orderId=${orderId}`;
  const callbackUrl = `${base}/api/payment/phonepe/callback`;

  const payload = {
    merchantId: PHONEPE_CONFIG.merchantId,
    merchantTransactionId: orderId,
    merchantUserId: "MU_" + order.phone,
    amount: order.total * 100, // paise
    redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl,
    mobileNumber: order.phone,
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const checksum =
    sha256hex(base64Payload + "/pg/v1/pay" + PHONEPE_CONFIG.saltKey) +
    "###" +
    PHONEPE_CONFIG.saltIndex;

  try {
    const res = await fetch(`${phonepeBaseUrl()}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        accept: "application/json",
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await res.json();

    if (data?.success && data?.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({
        ok: true,
        mode: "live",
        url: data.data.instrumentResponse.redirectInfo.url as string,
      });
    }

    console.error("[phonepe] pay failed:", data);
    return NextResponse.json(
      {
        ok: false,
        message:
          data?.message ||
          "PhonePe could not start the payment. Please try again.",
      },
      { status: 502 }
    );
  } catch (err) {
    console.error("[phonepe] pay error:", err);
    return NextResponse.json(
      { ok: false, message: "Payment gateway unreachable. Please try again." },
      { status: 502 }
    );
  }
}
