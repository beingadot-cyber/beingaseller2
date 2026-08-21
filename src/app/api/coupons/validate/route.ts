import { NextResponse } from "next/server";
import { shippingFor } from "@/data/products";
import { findCoupon, computeDiscount } from "@/lib/coupons";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "");
  const subtotal = Math.max(0, Number(body.subtotal ?? 0));

  const coupon = findCoupon(code);
  if (!coupon) {
    return NextResponse.json({ ok: false, message: "That coupon code isn't valid." }, { status: 400 });
  }

  const shipping = shippingFor(subtotal);
  const preDiscountTotal = subtotal + shipping;
  const discount = computeDiscount(coupon, preDiscountTotal);
  const total = Math.max(preDiscountTotal - discount, 0);

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    discount,
    shipping,
    total,
  });
}
