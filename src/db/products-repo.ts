import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products as productsTable, type ProductRow } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";
import { seedProducts } from "@/data/products-seed";
import type { Product } from "@/data/products";

/** Admin-facing shape: a Product plus its DB id and active flag. */
export type AdminProduct = Product & { id: string; active: boolean };

function rowToProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    category: row.category as Product["category"],
    price: row.price,
    mrp: row.mrp,
    sourcingPrice: row.sourcingPrice,
    sourcingRef: row.sourcingRef,
    rating: row.rating,
    reviews: row.reviews,
    image: row.image,
    accent: row.accent,
    sizes: (row.sizes as string[]) ?? [],
    description: row.description,
    highlights: (row.highlights as string[]) ?? [],
    fabric: row.fabric,
    dispatch: row.dispatch,
    active: row.active,
  };
}

let seeded: Promise<void> | null = null;

async function ensureSeeded() {
  await ensureSchema();
  if (!seeded) {
    seeded = (async () => {
      const existing = await db
        .select({ id: productsTable.id })
        .from(productsTable)
        .limit(1);
      if (existing.length === 0) {
        await db.insert(productsTable).values(
          seedProducts.map((p, i) => ({
            slug: p.slug,
            name: p.name,
            tagline: p.tagline,
            category: p.category,
            price: p.price,
            mrp: p.mrp,
            sourcingPrice: p.sourcingPrice,
            sourcingRef: p.sourcingRef,
            rating: p.rating,
            reviews: p.reviews,
            image: p.image,
            accent: p.accent,
            sizes: p.sizes,
            description: p.description,
            highlights: p.highlights,
            fabric: p.fabric,
            dispatch: p.dispatch,
            sortOrder: i,
            active: true,
          }))
        );
      }
    })().catch((err) => {
      seeded = null;
      throw err;
    });
  }
  return seeded;
}

/** Active products, in catalog order — what the storefront shows. */
export async function listActiveProducts(): Promise<Product[]> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.active, true))
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.createdAt));
  return rows.map(rowToProduct);
}

/** Every product including hidden ones — for the admin dashboard. */
export async function listAllProducts(): Promise<AdminProduct[]> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.sortOrder), asc(productsTable.createdAt));
  return rows.map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  await ensureSeeded();
  const [row] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, slug))
    .limit(1);
  return row ? rowToProduct(row) : undefined;
}

export type ProductInput = {
  slug: string;
  name: string;
  tagline: string;
  category: Product["category"];
  price: number;
  mrp: number;
  sourcingPrice: number;
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
  active: boolean;
};

export async function createProduct(input: ProductInput): Promise<AdminProduct> {
  await ensureSeeded();
  const [row] = await db.insert(productsTable).values(input).returning();
  return rowToProduct(row);
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<AdminProduct | undefined> {
  await ensureSeeded();
  const [row] = await db
    .update(productsTable)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(productsTable.id, id))
    .returning();
  return row ? rowToProduct(row) : undefined;
}

export async function deleteProduct(id: string): Promise<void> {
  await ensureSeeded();
  await db.delete(productsTable).where(eq(productsTable.id, id));
}
