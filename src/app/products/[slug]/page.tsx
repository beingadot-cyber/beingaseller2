import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, listActiveProducts } from "@/db/products-repo";
import { ProductView } from "./product-view";
import { ProductCard } from "@/components/product-card";
import { TickerStrip } from "@/components/marquee";

// Catalog is admin-editable at runtime, so render these on demand
// rather than freezing a static list at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: `${product.tagline}. Rated ${product.rating}★ by ${product.reviews} buyers. Prepaid only · delivered in 7–10 days.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const allProducts = await listActiveProducts();
  const related = allProducts
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .concat(allProducts.filter((p) => p.slug !== product.slug && p.category !== product.category))
    .slice(0, 3);

  return (
    <div className="relative pt-16">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-fog">
          <Link href="/" className="transition-colors hover:text-acid">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="transition-colors hover:text-acid">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-mist">{product.name}</span>
        </nav>
      </div>

      <ProductView product={product} />

      <div className="relative z-10 mt-8">
        <TickerStrip />
      </div>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-acid">
            <span className="inline-block size-1.5 rounded-full bg-acid" />
            Complete the fit
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            PAIRS <span className="text-outline">WELL WITH</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
