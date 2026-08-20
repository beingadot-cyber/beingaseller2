import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import {
  phonepeBaseUrl,
  phonepeConfigured,
  sha256hex,
  PHONEPE_CONFIG,
} from "@/lib/phonepe";

export const runtime = "nodejs";

type StatusPayload = {
  status: "PENDING" | "PAID" | "FAILED";
  orderId: string;
  total: number;
  demo: boolean;
  providerCode?: string | null;
  customerName?: string;
  city?: string;
  state?: string;
  items?: unknown;
};

function respond(order: typeof orders.$inferSelect, extra?: Partial<StatusPayload>) {
  const payload: StatusPayload = {
    status: order.status as StatusPayload["status"],
    orderId: order.id,
    total: order.total,
    demo: order.demo,
    providerCode: order.providerCode,
    customerName: order.customerName,
    city: order.city,
    state: order.state,
    items: order.items,
    ...extra,
  };
  return NextResponse.json({ ok: true, ...payload });
}

/**
 * POST /api/payment/phonepe/status  { orderId, demo? }
 *
 * Verifies the payment for an order and persists the latest status.
 * In demo mode (or for orders flagged demo) it simulates success.
 */
export async function POST(req: Request) {
  let orderId = "";
  let demoRequested = false;
  try {
    const body = await req.json();
    orderId = String(body.orderId ?? "");
    demoRequested = body.demo === true || body.demo === "1" || body.demo === "true";
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

  // Already final → return as-is
  if (order.status === "PAID" || order.status === "FAILED") {
    return respond(order);
  }

  /* ── Demo simulation ─────────────────────────────────────── */
  if (demoRequested && (order.demo || !phonepeConfigured())) {
    const [updated] = await db
      .update(orders)
      .set({
        status: "PAID",
        demo: true,
        providerCode: "DEMO_SUCCESS",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return respond(updated);
  }

  /* ── Live verification with PhonePe ──────────────────────── */
  if (!phonepeConfigured()) {
    // No credentials and not a demo request — still pending.
    return respond(order);
  }

  const merchantId = PHONEPE_CONFIG.merchantId;
  const checksum =
    sha256hex(`/pg/v1/status/${merchantId}/${orderId}` + PHONEPE_CONFIG.saltKey) +
    "###" +
    PHONEPE_CONFIG.saltIndex;

  try {
    const res = await fetch(
      `${phonepeBaseUrl()}/pg/v1/status/${merchantId}/${orderId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchantId,
          accept: "application/json",
        },
      }
    );
    const data = await res.json();
    const code: string = data?.code ?? "";

    let nextStatus: "PENDING" | "PAID" | "FAILED" = "PENDING";
    if (code === "PAYMENT_SUCCESS") nextStatus = "PAID";
    else if (
      code === "PAYMENT_ERROR" ||
      code === "PAYMENT_DECLINED" ||
      code === "PAYMENT_CANCELLED" ||
      code === "TRANSACTION_NOT_FOUND"
    ) {
      nextStatus = code === "TRANSACTION_NOT_FOUND" ? "PENDING" : "FAILED";
    }

    const [updated] = await db
      .update(orders)
      .set({
        status: nextStatus,
        providerCode: code || null,
        phonepeTxnId: data?.data?.transactionId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    return respond(updated);
  } catch (err) {
    console.error("[phonepe] status error:", err);
    return respond(order); // keep PENDING; client can retry
  }
}
