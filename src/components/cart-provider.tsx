"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getProduct } from "@/data/products";

export type CartItem = {
  slug: string;
  size: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, size: string, qty?: number) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "beingaseller-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const firstLoad = useRef(true);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        // Drop items for products that no longer exist
        setItems(parsed.filter((i) => getProduct(i.slug)));
      }
    } catch {
      /* corrupted storage — start fresh */
    }
    setHydrated(true);
    firstLoad.current = false;
  }, []);

  // Persist on change (skip the very first hydration pass)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const add = useCallback((slug: string, size: string, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.slug === slug && i.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + qty, 10) };
        return next;
      }
      return [...prev, { slug, size, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.size === size)));
  }, []);

  const setQty = useCallback(
    (slug: string, size: string, qty: number) => {
      if (qty <= 0) {
        remove(slug, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.slug === slug && i.size === size ? { ...i, qty: Math.min(qty, 10) } : i
        )
      );
    },
    [remove]
  );

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const item of items) {
      const product = getProduct(item.slug);
      if (!product) continue;
      count += item.qty;
      subtotal += product.price * item.qty;
    }
    return { count, subtotal };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      open,
      setOpen,
      add,
      remove,
      setQty,
      clear,
      hydrated,
    }),
    [items, count, subtotal, open, add, remove, setQty, clear, hydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
