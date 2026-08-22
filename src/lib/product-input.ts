import type { ProductInput } from "@/db/products-repo";

export const CATEGORIES = [
  "Tees",
  "Bottoms",
  "Sneakers",
  "Hoodies",
  "Jackets",
  "Accessories",
];

export function normalizeProductInput(
  body: Record<string, unknown>
): { input?: ProductInput; error?: string } {
  const slug = String(body.slug ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const name = String(body.name ?? "").trim();
  if (!slug) return { error: "Slug is required." };
  if (!name) return { error: "Name is required." };
  const category = String(body.category ?? "");
  if (!CATEGORIES.includes(category)) return { error: "Choose a valid category." };
  const price = Number(body.price);
  const mrp = Number(body.mrp);
  if (!Number.isFinite(price) || price <= 0) return { error: "Enter a valid price." };
  if (!Number.isFinite(mrp) || mrp <= 0) return { error: "Enter a valid MRP." };

  const sizes = Array.isArray(body.sizes)
    ? (body.sizes as unknown[]).map(String).map((s) => s.trim()).filter(Boolean)
    : String(body.sizes ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const highlights = Array.isArray(body.highlights)
    ? (body.highlights as unknown[]).map(String).map((s) => s.trim()).filter(Boolean)
    : String(body.highlights ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

  const images = Array.isArray(body.images)
    ? (body.images as unknown[]).map(String).map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    input: {
      slug,
      name,
      tagline: String(body.tagline ?? "").trim(),
      category: category as ProductInput["category"],
      price: Math.round(price),
      mrp: Math.round(mrp),
      sourcingPrice: Math.round(Number(body.sourcingPrice) || 0),
      sourcingRef: String(body.sourcingRef ?? "").trim(),
      productId: String(body.productId ?? "").trim(),
      rating: Number(body.rating) || 4.5,
      reviews: Math.round(Number(body.reviews)) || 0,
      image: String(body.image ?? "").trim(),
      images: images.length ? images : (String(body.image ?? "").trim() ? [String(body.image).trim()] : []),
      video: String(body.video ?? "").trim(),
      accent: String(body.accent ?? "#c8ff00").trim() || "#c8ff00",
      sizes: sizes.length ? sizes : ["One Size"],
      description: String(body.description ?? "").trim(),
      highlights,
      fabric: String(body.fabric ?? "").trim(),
      dispatch: String(body.dispatch ?? "Ships in 7–10 days").trim(),
      meeshoUrl: String(body.meeshoUrl ?? "").trim(),
      active: body.active !== false,
    },
  };
}
