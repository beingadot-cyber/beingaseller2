"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, SearchX } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/data/products";

export function ProductsBrowser({ products }: { products: Product[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <>
      {/* Filter chips */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
        <span className="mr-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-fog">
          <LayoutGrid size={14} className="text-acid" /> Filter
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`relative rounded-full px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
              active === cat
                ? "text-void"
                : "border border-white/12 text-mist hover:border-acid/50 hover:text-white"
            }`}
          >
            {active === cat && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-acid"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((product, i) => (
            <motion.div
              key={product.slug}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={product} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <span className="grid size-16 place-items-center rounded-full border border-dashed border-white/15 text-fog">
            <SearchX size={24} />
          </span>
          <p className="font-display font-semibold text-mist">
            Nothing in this lane yet — check back next drop.
          </p>
        </div>
      )}
    </>
  );
}
