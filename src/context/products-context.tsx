"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/data/products";

type ProductsContextValue = {
  products: Product[];
  loading: boolean;
  getProduct: (slug: string) => Product | undefined;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({
  initialProducts = [],
  children,
}: {
  initialProducts?: Product[];
  children: ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.ok && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(() => {
        /* keep whatever we already have (initialProducts, or empty) */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProduct = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products]
  );

  const value = useMemo(
    () => ({ products, loading, getProduct }),
    [products, loading, getProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductsProvider>");
  return ctx;
}
