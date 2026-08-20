export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: "Tees" | "Bottoms" | "Sneakers" | "Hoodies" | "Jackets" | "Accessories";
  /** Selling price on Beingaseller (INR) — 2× sourcing price */
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
};

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 49;

export const products: Product[] = [
  {
    slug: "midnight-aura-tee",
    name: "Midnight Aura Oversized Tee",
    tagline: "Cosmic gradient print on 240 GSM heavyweight cotton",
    category: "Tees",
    price: 676,
    mrp: 1352,
    sourcingPrice: 338,
    sourcingRef: "SRC-TEE-338",
    rating: 4.6,
    reviews: 312,
    image: "/products/midnight-aura-tee.png",
    accent: "#8b5cf6",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "The tee that does the talking before you enter the room. A boxy, drop-shoulder oversized fit cut from dense 240 GSM combed cotton, carrying a hand-finished cosmic gradient print in ultraviolet and acid. Pre-shrunk, bio-washed, and built to survive every wash cycle of your rotation.",
    highlights: [
      "240 GSM heavyweight combed cotton",
      "Boxy drop-shoulder oversized fit",
      "High-density gradient chest print",
      "Bio-washed & pre-shrunk — zero fade drama",
    ],
    fabric: "100% combed cotton · 240 GSM · bio-washed",
    dispatch: "Ships in 24–48 hrs",
  },
  {
    slug: "street-utility-cargo",
    name: "Street Utility Parachute Cargo",
    tagline: "Six-pocket baggy cargo with bungee hem",
    category: "Bottoms",
    price: 656,
    mrp: 1312,
    sourcingPrice: 328,
    sourcingRef: "SRC-CRG-328",
    rating: 4.5,
    reviews: 198,
    image: "/products/street-utility-cargo.png",
    accent: "#c8ff00",
    sizes: ["28", "30", "32", "34", "36"],
    description:
      "Parachute-fit cargos engineered for the city. Six utility pockets swallow your phone, wallet, and aux-cord-era secrets, while the bungee-cord hem lets you switch between stacked and cinched in one pull. Lightweight ripstop that moves when you move.",
    highlights: [
      "Featherlight ripstop parachute fabric",
      "6-pocket utility layout",
      "Bungee adjustable hem + drawstring waist",
      "Y2K baggy silhouette",
    ],
    fabric: "Poly-ripstop · quick-dry · wrinkle resistant",
    dispatch: "Ships in 24–48 hrs",
  },
  {
    slug: "cloud-walk-sneakers",
    name: "Cloud Walk Chunky Sneakers",
    tagline: "Retro-stacked sole with all-day foam cushioning",
    category: "Sneakers",
    price: 588,
    mrp: 1176,
    sourcingPrice: 294,
    sourcingRef: "SRC-SNK-294",
    rating: 4.7,
    reviews: 421,
    image: "/products/cloud-walk-sneakers.png",
    accent: "#a78bfa",
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    description:
      "A chunky retro silhouette riding on a stacked EVA sole that feels like walking on memory foam. Breathable mesh panels keep things ventilated while the ultraviolet accent hits give every step main-character energy.",
    highlights: [
      "Stacked EVA cloud sole — 4cm lift",
      "Breathable engineered mesh upper",
      "Anti-skid rubber outsole",
      "Cushioned collar for all-day wear",
    ],
    fabric: "Engineered mesh + PU overlays · EVA sole",
    dispatch: "Ships in 24–48 hrs",
  },
  {
    slug: "neon-drip-hoodie",
    name: "Neon Drip Oversized Hoodie",
    tagline: "400 GSM brushed-fleece hoodie with embroidered hit",
    category: "Hoodies",
    price: 568,
    mrp: 1136,
    sourcingPrice: 284,
    sourcingRef: "SRC-HOD-284",
    rating: 4.5,
    reviews: 167,
    image: "/products/neon-drip-hoodie.png",
    accent: "#c084fc",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Heavy. Soft. Loud in a quiet way. A 400 GSM brushed-fleece hoodie in washed lavender with a minimal acid-thread embroidered logo. Kangaroo pocket, double-lined hood, ribbed everything — this is the one you will live in from October to February.",
    highlights: [
      "400 GSM brushed-back fleece",
      "Double-lined hood, no drawcord mess",
      "Acid-thread chest embroidery",
      "Ribbed cuffs & hem — holds shape",
    ],
    fabric: "Cotton-rich fleece · 400 GSM · brushed inside",
    dispatch: "Ships in 24–48 hrs",
  },
  {
    slug: "vintage-wash-denim",
    name: "Vintage Wash Denim Jacket",
    tagline: "Acid-washed trucker with brass hardware",
    category: "Jackets",
    price: 578,
    mrp: 1156,
    sourcingPrice: 289,
    sourcingRef: "SRC-DNM-289",
    rating: 4.6,
    reviews: 244,
    image: "/products/vintage-wash-denim.png",
    accent: "#7dd3fc",
    sizes: ["S", "M", "L", "XL"],
    description:
      "An oversized trucker jacket in a perfectly imperfect vintage acid wash. Rigid 12oz denim that breaks in like a good playlist — stiff at first, then completely yours. Antique brass buttons and drop shoulders complete the thrift-store-grail look without the thrift-store search.",
    highlights: [
      "12oz rigid denim, authentic acid wash",
      "Oversized drop-shoulder trucker cut",
      "Antique brass hardware",
      "Gets better with every wear",
    ],
    fabric: "100% cotton denim · 12oz · enzyme washed",
    dispatch: "Ships in 24–48 hrs",
  },
  {
    slug: "urban-sling-bag",
    name: "Urban Sling Crossbody Bag",
    tagline: "Water-repellent utility sling with acid zips",
    category: "Accessories",
    price: 570,
    mrp: 1140,
    sourcingPrice: 285,
    sourcingRef: "SRC-BAG-285",
    rating: 4.8,
    reviews: 389,
    image: "/products/urban-sling-bag.png",
    accent: "#bef264",
    sizes: ["One Size"],
    description:
      "The everyday carry, upgraded. Matte-black ballistic nylon with acid-green zip pulls, a quick-release buckle, and enough compartments to organise the chaos — phone, cards, keys, power bank, lip balm, all of it. Water-repellent coating keeps your tech dry when the weather decides otherwise.",
    highlights: [
      "Ballistic-grade water-repellent nylon",
      "5 organised compartments",
      "Quick-release magnetic buckle",
      "Adjustable strap — chest or back carry",
    ],
    fabric: "Ballistic nylon · YKK-style zips · padded back",
    dispatch: "Ships in 24–48 hrs",
  },
];

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

export const categories = [
  "All",
  ...Array.from(new Set(products.map((p) => p.category))),
];

export function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
