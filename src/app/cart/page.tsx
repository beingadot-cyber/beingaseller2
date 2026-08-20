"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import {
  formatINR,
  getProduct,
  shippingFor,
  FREE_SHIPPING_THRESHOLD,
} from "@/data/products";

export default function CartPage() {
  const { items, hydrated, setQty, remove, subtotal, clear } = useCart();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="size-10 animate-spin rounded-full border-2 border-acid border-t-transparent" />
      </div>
    );
  }

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);

  return (
    <div className="relative min-h-screen overflow-hidden pt-16">
      <div className="pointer-events-none absolute -top-24 left-1/3 size-[28rem] rounded-full bg-viol/12 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-acid">
              <span className="inline-block size-1.5 rounded-full bg-acid" />
              Step 01 · Review
            </p>
            <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
              YOUR <span className="text-outline">BAG</span>
            </h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-fog transition-colors hover:text-red-400"
            >
              <Trash2 size={13} /> Clear bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 rounded-3xl border border-dashed border-white/12 py-28 text-center"
          >
            <span className="grid size-20 place-items-center rounded-full border border-line bg-panel text-fog">
              <ShoppingBag size={30} />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold">
                Nothing in here yet
              </p>
              <p className="mt-2 text-sm text-mist">
                The drop is live and rated 4.5+. Go fill this bag up.
              </p>
            </div>
            <Link href="/products" className="btn-acid text-sm">
              Shop the drop <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            {/* Items */}
            <div>
              {/* Free shipping bar */}
              <div className="mb-6 rounded-2xl border border-line bg-panel p-5">
                <div className="mb-2.5 flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
                  <Truck size={14} className="text-acid" />
                  {shipping === 0 ? (
                    <span className="font-semibold text-acid">
                      Free shipping unlocked — nice.
                    </span>
                  ) : (
                    <span className="text-mist">
                      Add{" "}
                      <span className="font-semibold text-acid">
                        {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)}
                      </span>{" "}
                      more for free shipping
                    </span>
                  )}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-viol to-acid"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>
              </div>

              <ul className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const product = getProduct(item.slug);
                    if (!product) return null;
                    return (
                      <motion.li
                        key={`${item.slug}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ duration: 0.3 }}
                        className="sheen flex gap-5 rounded-3xl border border-line bg-panel p-4 sm:p-5"
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-panel-2 sm:size-32"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="128px"
                            className="object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-fog">
                                {product.category}
                              </span>
                              <Link href={`/products/${product.slug}`}>
                                <h3 className="truncate font-display text-base font-bold transition-colors hover:text-acid sm:text-lg">
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="mt-0.5 text-xs text-fog">
                                Size · {item.size} · {product.dispatch}
                              </p>
                            </div>
                            <button
                              onClick={() => remove(item.slug, item.size)}
                              className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 text-fog transition-all hover:border-red-400/60 hover:text-red-400"
                              aria-label="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                            <div className="flex items-center gap-1 rounded-full border border-line px-1.5 py-1.5">
                              <button
                                onClick={() => setQty(item.slug, item.size, item.qty - 1)}
                                className="grid size-8 place-items-center rounded-full transition-colors hover:bg-white/10"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-7 text-center font-display text-sm font-bold">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => setQty(item.slug, item.size, item.qty + 1)}
                                className="grid size-8 place-items-center rounded-full transition-colors hover:bg-white/10"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-xl font-extrabold text-acid">
                                {formatINR(product.price * item.qty)}
                              </p>
                              {item.qty > 1 && (
                                <p className="text-xs text-fog">
                                  {formatINR(product.price)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist transition-colors hover:text-acid"
              >
                <ArrowLeft size={14} /> Keep shopping
              </Link>
            </div>

            {/* Summary */}
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:sticky lg:top-24 h-fit rounded-3xl border border-line bg-panel p-7"
            >
              <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">
                Order summary
              </h2>

              <dl className="mt-6 flex flex-col gap-3.5 border-b border-line pb-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-mist">Subtotal</dt>
                  <dd className="font-semibold">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Shipping</dt>
                  <dd className={shipping === 0 ? "font-semibold text-acid" : "font-semibold"}>
                    {shipping === 0 ? "FREE" : formatINR(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Returns window</dt>
                  <dd className="font-semibold text-fog">None — final sale</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-[0.2em] text-mist">Total</span>
                <span className="font-display text-3xl font-extrabold text-acid">
                  {formatINR(total)}
                </span>
              </div>

              <Link href="/checkout" className="btn-acid mt-7 w-full justify-center text-sm">
                Checkout <ArrowRight size={16} />
              </Link>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-ink p-4">
                <div className="flex items-center gap-2.5 text-xs text-mist">
                  <Lock size={14} className="shrink-0 text-acid" />
                  256-bit encrypted checkout via PhonePe
                </div>
                <div className="flex items-center gap-2.5 text-xs text-mist">
                  <ShieldCheck size={14} className="shrink-0 text-acid" />
                  Prepaid only — UPI, cards, netbanking
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </div>
    </div>
  );
}
