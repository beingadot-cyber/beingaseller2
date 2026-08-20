"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatINR, getProduct, FREE_SHIPPING_THRESHOLD } from "@/data/products";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();
  const router = useRouter();

  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-md flex-col border-l border-line bg-ink"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="flex items-center gap-3 font-display text-lg font-bold">
                <ShoppingBag size={18} className="text-acid" />
                YOUR BAG
                <span className="rounded-full bg-acid px-2.5 py-0.5 font-display text-xs font-bold text-void">
                  {items.reduce((a, i) => a + i.qty, 0)}
                </span>
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-white/10 transition-colors hover:border-acid/60 hover:text-acid"
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            {/* Free shipping meter */}
            <div className="border-b border-line px-6 py-4">
              <p className="mb-2 text-xs uppercase tracking-[0.15em] text-mist">
                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                  <span className="text-acid">Free shipping unlocked</span>
                ) : (
                  <>
                    <span className="text-acid">
                      {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)}
                    </span>{" "}
                    away from free shipping
                  </>
                )}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-viol to-acid"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="grid size-16 place-items-center rounded-full border border-dashed border-white/15 text-fog">
                    <ShoppingBag size={24} />
                  </div>
                  <p className="font-display font-semibold text-mist">
                    Your bag is empty
                  </p>
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push("/products");
                    }}
                    className="btn-acid !px-6 !py-3 text-xs"
                  >
                    Shop the drop <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const product = getProduct(item.slug);
                      if (!product) return null;
                      return (
                        <motion.li
                          key={`${item.slug}-${item.size}`}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          className="flex gap-4 rounded-2xl border border-line bg-panel p-3"
                        >
                          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-panel-2">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-semibold">
                                {product.name}
                              </p>
                              <button
                                onClick={() => remove(item.slug, item.size)}
                                className="text-fog transition-colors hover:text-red-400"
                                aria-label="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <p className="mt-0.5 text-xs text-fog">
                              Size · {item.size}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2 rounded-full border border-line px-1.5 py-1">
                                <button
                                  onClick={() =>
                                    setQty(item.slug, item.size, item.qty - 1)
                                  }
                                  className="grid size-6 place-items-center rounded-full transition-colors hover:bg-white/10"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-5 text-center font-display text-xs font-bold">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() =>
                                    setQty(item.slug, item.size, item.qty + 1)
                                  }
                                  className="grid size-6 place-items-center rounded-full transition-colors hover:bg-white/10"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <p className="font-display text-sm font-bold text-acid">
                                {formatINR(product.price * item.qty)}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.15em] text-mist">
                    Subtotal
                  </span>
                  <span className="font-display text-xl font-extrabold">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="btn-ghost justify-center !px-4 !py-3 text-xs"
                  >
                    View cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="btn-acid justify-center !px-4 !py-3 text-xs"
                  >
                    Checkout <ArrowRight size={14} />
                  </Link>
                </div>
                <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.2em] text-fog">
                  Prepaid only · No COD · No returns
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
