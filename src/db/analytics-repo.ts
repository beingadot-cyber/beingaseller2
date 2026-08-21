import "server-only";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";

/** Only these statuses count as a real sale (not a pending/failed/cancelled cart). */
const COUNTED_STATUSES = new Set(["PAID", "SHIPPED", "DELIVERED"]);

type OrderItem = { slug: string; name: string; image: string; qty: number; price: number };

export type LocationBreakdown = { label: string; qty: number };

export type ProductSales = {
  slug: string;
  name: string;
  image: string;
  qty: number;
  revenue: number;
  orderCount: number;
  topStates: LocationBreakdown[];
  topCities: LocationBreakdown[];
};

export type DailyPoint = { date: string; revenue: number; orders: number };

export type SalesAnalytics = {
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  avgOrderValue: number;
  daily: DailyPoint[]; // last 30 days, oldest first
  products: ProductSales[]; // sorted by qty sold, descending
  topStates: LocationBreakdown[]; // overall, all products combined
};

function topN(map: Map<string, number>, n: number): LocationBreakdown[] {
  return Array.from(map.entries())
    .map(([label, qty]) => ({ label, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, n);
}

export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  await ensureSchema();
  const rows = await db.select().from(orders);
  const counted = rows.filter((o) => COUNTED_STATUSES.has(o.status));

  let totalRevenue = 0;
  let totalUnits = 0;

  const dayMap = new Map<string, { revenue: number; orders: number }>();
  const overallStateMap = new Map<string, number>();

  const productAgg = new Map<
    string,
    {
      name: string;
      image: string;
      qty: number;
      revenue: number;
      orderCount: number;
      stateMap: Map<string, number>;
      cityMap: Map<string, number>;
    }
  >();

  for (const order of counted) {
    totalRevenue += order.total;

    const day = new Date(order.createdAt).toISOString().slice(0, 10);
    const d = dayMap.get(day) ?? { revenue: 0, orders: 0 };
    d.revenue += order.total;
    d.orders += 1;
    dayMap.set(day, d);

    const state = order.state || "Unknown";
    const city = order.city || "Unknown";
    overallStateMap.set(state, (overallStateMap.get(state) ?? 0) + 1);

    const items = (order.items as OrderItem[]) ?? [];
    for (const item of items) {
      totalUnits += item.qty;
      const agg = productAgg.get(item.slug) ?? {
        name: item.name,
        image: item.image,
        qty: 0,
        revenue: 0,
        orderCount: 0,
        stateMap: new Map<string, number>(),
        cityMap: new Map<string, number>(),
      };
      agg.qty += item.qty;
      agg.revenue += item.price * item.qty;
      agg.orderCount += 1;
      agg.stateMap.set(state, (agg.stateMap.get(state) ?? 0) + item.qty);
      agg.cityMap.set(city, (agg.cityMap.get(city) ?? 0) + item.qty);
      productAgg.set(item.slug, agg);
    }
  }

  // Last 30 days, oldest first, zero-filled for days with no sales.
  const daily: DailyPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    daily.push({ date: key, revenue: entry?.revenue ?? 0, orders: entry?.orders ?? 0 });
  }

  const products: ProductSales[] = Array.from(productAgg.entries())
    .map(([slug, agg]) => ({
      slug,
      name: agg.name,
      image: agg.image,
      qty: agg.qty,
      revenue: agg.revenue,
      orderCount: agg.orderCount,
      topStates: topN(agg.stateMap, 5),
      topCities: topN(agg.cityMap, 5),
    }))
    .sort((a, b) => b.qty - a.qty);

  return {
    totalRevenue,
    totalOrders: counted.length,
    totalUnits,
    avgOrderValue: counted.length ? Math.round(totalRevenue / counted.length) : 0,
    daily,
    products,
    topStates: topN(overallStateMap, 8),
  };
}
