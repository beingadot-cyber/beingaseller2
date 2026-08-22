import { NextResponse } from "next/server";
import { shippingFor } from "@/data/products";
import {
  findCoupon,
  computeDiscount,
  shippingOverride,
  minUnitsRequired,
  totalUnits,
  type PricedItem,
} from "@/lib/coupons";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "");
  const subtotal = Math.max(0, Number(body.subtotal ?? 0));
  const items: PricedItem[] = Array.isArray(body.items)
    ? body.items.map((i: { price?: unknown; qty?: unknown }) => ({
        price: Math.max(0, Number(i.price) || 0),
        qty: Math.max(1, Math.floor(Number(i.qty) || 1)),
      }))
    : [];

  const coupon = findCoupon(code);
  if (!coupon) {
    return NextResponse.json({ ok: false, message: "That coupon code isn't valid." }, { status: 400 });
  }

  const minUnits = minUnitsRequired(coupon);
  if (minUnits > 0 && totalUnits(items) < minUnits) {
    return NextResponse.json(
      { ok: false, message: `Add at least ${minUnits} items to your cart to use this coupon.` },
      { status: 400 }
    );
  }

  const baseShipping = shippingFor(subtotal);
  const shipping = shippingOverride(coupon) ?? baseShipping;
  const discount = computeDiscount(coupon, { subtotal, shipping, items });
  const total = Math.max(subtotal + shipping - discount, 0);

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    discount,
    shipping,
    total,
  });
}
