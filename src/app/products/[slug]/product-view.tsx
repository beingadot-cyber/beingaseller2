"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Ban,
  Check,
  ChevronDown,
  Minus,
  Package,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { formatINR, type Product, FREE_SHIPPING_THRESHOLD } from "@/data/products";
import { RatingStars } from "@/components/rating-stars";
import { useCart } from "@/components/cart-provider";

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left font-display text-sm font-bold uppercase tracking-[0.15em] transition-colors hover:text-acid"
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${open ? "rotate-180 text-acid" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm leading-relaxed text-mist">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductView({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQtyLocal] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeMedia, setActiveMedia] = useState<{ type: "image" | "video"; index: number }>({
    type: "image",
    index: 0,
  });

  const savings = product.mrp - product.price;
  const offPct = Math.round((savings / product.mrp) * 100);
  const freeShip = product.price >= FREE_SHIPPING_THRESHOLD;

  const pickSize = (s: string) => {
    setSize(s);
    setError(null);
  };

  const handleAdd = () => {
    if (!size) {
      setError("Pick a size first — no returns means no second chances.");
      return;
    }
    add(product.slug, size, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!size) {
      setError("Pick a size first — no returns means no second chances.");
      return;
    }
    add(product.slug, size, qty);
    router.push("/checkout");
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ── Visual panel ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="sticky top-24">
            <div className="group relative aspect-square overflow-hidden rounded-3xl border border-line bg-panel-2">
              {/* Accent glow */}
              <div
                className="absolute inset-0 opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-45"
                style={{
                  background: `radial-gradient(circle at 50% 60%, ${product.accent}, transparent 65%)`,
                }}
              />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {activeMedia.type === "video" && product.video ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={product.video}
                    className="h-full w-full object-cover"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={gallery[activeMedia.index] ?? product.image}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.07]"
                  />
                )}
              </motion.div>

              <div className="absolute left-4 top-4 flex flex-col gap-2">
                <span className="rounded-full bg-acid px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-widest text-void">
                  {offPct}% off
                </span>
                <span className="glass rounded-full px-3.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest">
                  {product.category}
                </span>
              </div>
            </div>

            {(gallery.length > 1 || product.video) && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveMedia({ type: "image", index: i })}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeMedia.type === "image" && activeMedia.index === i
                        ? "border-acid"
                        : "border-line opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
                {product.video && (
                  <button
                    onClick={() => setActiveMedia({ type: "video", index: 0 })}
                    className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-panel-2 transition ${
                      activeMedia.type === "video"
                        ? "border-acid"
                        : "border-line opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Play size={20} className="text-acid" />
                  </button>
                )}
              </div>
            )}

            {/* Under-image strip */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: freeShip ? "Free shipping" : "₹49 shipping" },
                { icon: Zap, label: product.dispatch },
                { icon: ShieldCheck, label: "Quality checked" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2.5"
                >
                  <f.icon size={14} className="shrink-0 text-acid" />
                  <span className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-mist">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Info panel ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Rating */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-acid px-3 py-1 font-display text-xs font-bold text-void">
              {product.rating.toFixed(1)} <Check size={12} strokeWidth={3} />
            </span>
            <RatingStars rating={product.rating} size={16} />
            <span className="text-sm text-fog">{product.reviews} verified reviews</span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-mist">{product.tagline}</p>

          {/* Price */}
          <div className="mt-7 flex flex-wrap items-end gap-3 border-y border-line py-6">
            <span className="font-display text-4xl font-extrabold text-acid sm:text-5xl">
              {formatINR(product.price)}
            </span>
            <span className="pb-1.5 text-xl text-fog line-through">
              {formatINR(product.mrp)}
            </span>
            <span className="mb-1.5 rounded-full border border-acid/40 bg-acid/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-acid">
              Save {formatINR(savings)}
            </span>
          </div>

          {/* Size */}
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm font-bold uppercase tracking-[0.2em]">
                Select size
              </p>
              <span className="text-xs text-fog">
                {product.category === "Sneakers"
                  ? "Go half up if between sizes"
                  : product.sizes.length > 1
                    ? "Oversized fit — true to size"
                    : "Adjustable strap"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => pickSize(s)}
                  className={`min-w-14 rounded-xl border px-4 py-3 font-display text-sm font-bold transition-all duration-200 ${
                    size === s
                      ? "border-acid bg-acid text-void shadow-[0_8px_25px_-6px_rgba(200,255,0,0.5)]"
                      : "border-white/12 text-mist hover:border-acid/50 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 text-sm text-red-400"
                >
                  <Ban size={14} /> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Qty + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-line px-2 py-2">
              <button
                onClick={() => setQtyLocal((q) => Math.max(1, q - 1))}
                className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/10"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-display font-bold">{qty}</span>
              <button
                onClick={() => setQtyLocal((q) => Math.min(10, q + 1))}
                className="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/10"
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>

            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost flex-1 justify-center !py-4 text-sm"
            >
              {justAdded ? (
                <>
                  <Check size={16} className="text-acid" /> Added to bag
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to bag
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleBuyNow}
              whileTap={{ scale: 0.97 }}
              className="btn-acid flex-1 justify-center !py-4 text-sm"
            >
              Buy it now
            </motion.button>
          </div>

          {/* Policy reminder */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-panel px-4 py-3">
              <ShieldCheck size={16} className="shrink-0 text-acid" />
              <p className="text-xs leading-snug text-mist">
                <span className="font-semibold text-white">Prepaid only</span> via
                PhonePe — UPI, cards, netbanking
              </p>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-panel px-4 py-3">
              <RotateCcw size={16} className="shrink-0 text-acid" />
              <p className="text-xs leading-snug text-mist">
                <span className="font-semibold text-white">All sales final</span> —
                no returns or exchanges
              </p>
            </div>
          </div>

          {/* Highlights */}
          <ul className="mt-8 flex flex-col gap-2.5">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-mist">
                <BadgeCheck size={16} className="mt-0.5 shrink-0 text-acid" />
                {h}
              </li>
            ))}
          </ul>

          {/* Accordions */}
          <div className="mt-8 border-t border-line">
            <Accordion title="The full story">
              {product.description}
            </Accordion>
            <Accordion title="Fabric & care">
              {product.fabric}. Machine wash cold, inside out. Do not bleach.
              Hang dry in shade to keep the colours loud.
            </Accordion>
            <Accordion title="Shipping & delivery">
              <span className="flex items-start gap-2">
                <Package size={15} className="mt-0.5 shrink-0 text-acid" />
                <span>
                  {product.dispatch}. Delivered across India in 7–10 working days.
                  {freeShip
                    ? " This item ships free."
                    : ` Flat ₹49 shipping — free on orders above ${formatINR(FREE_SHIPPING_THRESHOLD)}.`}{" "}
                  Tracking link shared by SMS and email as soon as your order
                  leaves the warehouse.
                </span>
              </span>
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
