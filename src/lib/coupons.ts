/**
 * Coupon codes.
 *
 * This is a simple hardcoded map for now — edit this file (or wire it up
 * to a database table later) to add/remove/change coupons before launch.
 *
 *   ILOVEYOU → 100% off (subtotal + shipping), i.e. the order becomes free.
 *   Remove or change this before going live for real customers.
 */

export type Coupon = {
  code: string;
  type: "percent" | "flat";
  /** percent: 0-100. flat: rupees. */
  value: number;
};

export const COUPONS: Record<string, Coupon> = {
  ILOVEYOU: { code: "ILOVEYOU", type: "percent", value: 100 },
};

export function findCoupon(rawCode: string): Coupon | null {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) return null;
  return COUPONS[code] ?? null;
}

/**
 * Computes the discount amount off a pre-discount total
 * (subtotal + shipping). Never returns more than the total itself.
 */
export function computeDiscount(coupon: Coupon, preDiscountTotal: number): number {
  const raw =
    coupon.type === "percent"
      ? Math.round((preDiscountTotal * coupon.value) / 100)
      : Math.round(coupon.value);
  return Math.max(0, Math.min(raw, preDiscountTotal));
}
