/**
 * Coupon codes.
 *
 * This is a simple hardcoded map for now — edit this file (or wire it up
 * to a database table later) to add/remove/change coupons before launch.
 *
 *   ILOVEYOU     → 100% off (subtotal + shipping), i.e. the order becomes free.
 *                  Remove or change this before going live for real customers.
 *   B2G1         → Buy 2 Get 1 Free. Needs at least 3 items in the cart.
 *                  Every full group of 3 units (sorted priciest-first) gets
 *                  its cheapest unit free — the two priciest are paid for.
 *   FREEDELIVERY → Waives shipping entirely, on any order amount.
 */

export type Coupon =
  | { code: string; type: "percent"; value: number }
  | { code: string; type: "flat"; value: number }
  | { code: string; type: "free_shipping" }
  | { code: string; type: "buy2get1" };

export const COUPONS: Record<string, Coupon> = {
  ILOVEYOU: { code: "ILOVEYOU", type: "percent", value: 100 },
  B2G1: { code: "B2G1", type: "buy2get1" },
  FREEDELIVERY: { code: "FREEDELIVERY", type: "free_shipping" },
};

export type PricedItem = { price: number; qty: number };

export function findCoupon(rawCode: string): Coupon | null {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) return null;
  return COUPONS[code] ?? null;
}

export function totalUnits(items: PricedItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

/** Buy 2 Get 1: expand quantities into individual units, sort priciest
 * first, and for every complete group of 3 the cheapest unit in that
 * group is free. Leftover units (fewer than 3) get no discount. */
function buy2Get1Discount(items: PricedItem[]): number {
  const units: number[] = [];
  for (const item of items) {
    for (let i = 0; i < item.qty; i++) units.push(item.price);
  }
  units.sort((a, b) => b - a);
  let discount = 0;
  for (let i = 0; i + 2 < units.length; i += 3) {
    discount += units[i + 2];
  }
  return discount;
}

/** Minimum total item quantity a coupon requires to be usable, if any. */
export function minUnitsRequired(coupon: Coupon): number {
  return coupon.type === "buy2get1" ? 3 : 0;
}

/** If a coupon overrides shipping outright (e.g. free delivery), returns
 * that shipping value; otherwise null (use the normal shippingFor() rate). */
export function shippingOverride(coupon: Coupon): number | null {
  return coupon.type === "free_shipping" ? 0 : null;
}

/**
 * Computes the discount amount. `shipping` should already reflect any
 * shippingOverride() for this coupon. Never returns more than subtotal + shipping.
 */
export function computeDiscount(
  coupon: Coupon,
  { subtotal, shipping, items }: { subtotal: number; shipping: number; items: PricedItem[] }
): number {
  const preDiscountTotal = subtotal + shipping;

  if (coupon.type === "free_shipping") return 0;

  if (coupon.type === "buy2get1") {
    return Math.max(0, Math.min(buy2Get1Discount(items), preDiscountTotal));
  }

  const raw =
    coupon.type === "percent"
      ? Math.round((preDiscountTotal * coupon.value) / 100)
      : Math.round(coupon.value);
  return Math.max(0, Math.min(raw, preDiscountTotal));
}
