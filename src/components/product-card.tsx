"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { formatINR, type Product } from "@/data/products";
import { RatingStars } from "./rating-stars";
import { useCart } from "./cart-provider";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { add } = useCart();
  const [defaultSize] = useState(
    product.sizes[Math.min(1, product.sizes.length - 1)]
  );

  // 3D tilt physics
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), {
    stiffness: 180,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), {
    stiffness: 180,
    damping: 18,
  });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const savings = product.mrp - product.price;
  const offPct = Math.round((savings / product.mrp) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="sheen group relative rounded-3xl border border-line bg-panel transition-colors duration-300 hover:border-white/20"
      >
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-25"
          style={{ background: product.accent }}
        />

        {/* Image */}
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-square overflow-hidden rounded-t-3xl bg-panel-2"
        >
          <motion.div
            style={{ transform: "translateZ(30px)" }}
            className="absolute inset-0"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          </motion.div>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <span className="rounded-full bg-acid px-3 py-1 font-display text-[0.65rem] font-bold uppercase tracking-widest text-void">
              {offPct}% off
            </span>
            <span className="glass rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
              {product.category}
            </span>
          </div>

          {/* Quick view arrow */}
          <span className="absolute right-3 top-3 grid size-9 translate-y-2 place-items-center rounded-full bg-white text-void opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={16} />
          </span>
        </Link>

        {/* Body */}
        <div className="relative p-5" style={{ transform: "translateZ(20px)" }}>
          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-xs font-semibold text-acid">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-fog">({product.reviews})</span>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="mt-2 font-display text-base font-bold leading-snug transition-colors group-hover:text-acid">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-1 text-xs text-fog">{product.tagline}</p>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl font-extrabold">
                  {formatINR(product.price)}
                </span>
                <span className="text-sm text-fog line-through">
                  {formatINR(product.mrp)}
                </span>
              </div>
              <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-fog">
                Save {formatINR(savings)}
              </p>
            </div>

            <button
              onClick={() => add(product.slug, defaultSize)}
              className="grid size-11 place-items-center rounded-full border border-acid/40 bg-acid/10 text-acid transition-all duration-300 hover:rotate-90 hover:bg-acid hover:text-void"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
