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
  /** Your own product/SKU ID for internal tracking — never rendered on the storefront, shown in the admin orders panel */
  productId?: string;
  rating: number;
  reviews: number;
  image: string;
  /** Full photo gallery for the product page — falls back to just [image] if empty */
  images?: string[];
  /** Optional product video URL */
  video?: string;
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
