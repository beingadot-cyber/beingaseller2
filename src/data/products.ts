export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: "Tees" | "Bottoms" | "Sneakers" | "Hoodies" | "Jackets" | "Accessories";
  /** Selling price on Beingaseller (INR) */
  price: number;
  /** Compare-at MRP (INR) shown struck through */
  mrp: number;
  /** Internal sourcing cost (INR) — never rendered in the UI */
  sourcingPrice: number;
  /** Internal sourcing reference — never rendered in the UI */
  sourcingRef: string;
  rating: number;
  reviews: number;
  image: string;
  accent: string;
  sizes: string[];
  description: string;
  highlights: string[];
  fabric: string;
  dispatch: string;
  /** Original Meesho listing this was imported from (optional) — internal, never rendered on the storefront */
  meeshoUrl?: string;
};

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 49;

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
