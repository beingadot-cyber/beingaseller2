import type { Metadata } from "next";
import { ProductsBrowser } from "./products-browser";
import { MarqueeRow } from "@/components/marquee";
import { listActiveProducts } from "@/db/products-repo";

export const metadata: Metadata = {
  title: "Shop the Drop",
  description:
    "Six hand-picked streetwear pieces rated 4.5+. Prepaid only, no COD, no returns — delivered across India in 7–10 days.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listActiveProducts();
  return (
    <div className="relative overflow-hidden pt-16">
      {/* Backdrop */}
      <div className="pointer-events-none absolute -top-20 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-viol/15 blur-[160px]" />

      {/* Header */}
      <div className="relative border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-acid">
            <span className="inline-block size-1.5 rounded-full bg-acid" />
            {products.length} pieces · restocks never promised
          </p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            THE FULL <span className="text-outline">DROP</span>
          </h1>
          <p className="mt-4 max-w-xl text-mist">
            Every product below is rated 4.5 stars or higher and quality-checked
            before dispatch. Anything less never makes it here.
          </p>
        </div>
        <div className="border-t border-line py-3 text-fog">
          <MarqueeRow>
            {["240 GSM tees", "400 GSM fleece", "12oz denim", "4.5+ rated only", "Prepaid · secure checkout", "Delivered in 7–10 days"].map(
              (t, i) => (
                <span
                  key={i}
                  className="mx-6 flex items-center gap-6 text-xs uppercase tracking-[0.25em]"
                >
                  {t} <span className="text-acid">✦</span>
                </span>
              )
            )}
          </MarqueeRow>
        </div>
      </div>

      {/* Browser (filter + grid) */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ProductsBrowser products={products} />
      </div>
    </div>
  );
}
