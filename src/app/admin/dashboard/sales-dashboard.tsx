"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { IndianRupee, MapPin, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { formatINR } from "@/data/products";
import type { SalesAnalytics } from "@/db/analytics-repo";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-ink p-4">
      <div className="mb-2 flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}

function RevenueTrend({ daily }: { daily: SalesAnalytics["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.revenue));
  return (
    <div className="rounded-xl border border-line bg-ink p-4">
      <div className="mb-4 flex items-center gap-2 text-white/40">
        <TrendingUp size={15} />
        <span className="text-xs font-medium">Revenue — last 30 days</span>
      </div>
      <div className="flex h-32 items-end gap-[3px]">
        {daily.map((d) => (
          <div key={d.date} className="group relative flex-1">
            <div
              className="w-full rounded-sm bg-acid/70 transition group-hover:bg-acid"
              style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md border border-line bg-void px-2 py-1 text-[11px] opacity-0 shadow-lg transition group-hover:opacity-100">
              <div className="font-medium">{formatINR(d.revenue)}</div>
              <div className="text-white/50">
                {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·{" "}
                {d.orders} order{d.orders !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationBars({ items, max }: { items: { label: string; qty: number }[]; max: number }) {
  if (items.length === 0) {
    return <p className="text-sm text-white/40">No sales yet.</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-sm">
          <span className="w-28 shrink-0 truncate text-white/70">{it.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-acid"
              style={{ width: `${Math.max(4, (it.qty / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-white/50">{it.qty}</span>
        </div>
      ))}
    </div>
  );
}

export function SalesDashboard({ analytics }: { analytics: SalesAnalytics }) {
  const { totalRevenue, totalOrders, totalUnits, avgOrderValue, daily, products, topStates } = analytics;
  const [selectedSlug, setSelectedSlug] = useState<string>(products[0]?.slug ?? "");

  const selected = useMemo(
    () => products.find((p) => p.slug === selectedSlug) ?? products[0],
    [products, selectedSlug]
  );

  const maxQty = Math.max(1, ...products.map((p) => p.qty));
  const maxOverallState = Math.max(1, ...topStates.map((s) => s.qty));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-white/50">
          Based on {totalOrders} paid order{totalOrders !== 1 ? "s" : ""}. Pending/failed/cancelled
          orders aren&apos;t counted as sales.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<IndianRupee size={14} />} label="Total revenue" value={formatINR(totalRevenue)} />
        <StatCard icon={<ShoppingBag size={14} />} label="Orders" value={String(totalOrders)} />
        <StatCard icon={<Package size={14} />} label="Units sold" value={String(totalUnits)} />
        <StatCard icon={<TrendingUp size={14} />} label="Avg. order value" value={formatINR(avgOrderValue)} />
      </div>

      <div className="mb-6">
        <RevenueTrend daily={daily} />
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-line bg-ink p-10 text-center text-white/50">
          No paid sales yet — this fills in once orders come through with status Paid, Shipped, or
          Delivered.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Top products — comparison */}
          <div className="rounded-xl border border-line bg-ink p-4">
            <div className="mb-4 flex items-center gap-2 text-white/40">
              <Package size={15} />
              <span className="text-xs font-medium">Top products by units sold</span>
            </div>
            <div className="space-y-3">
              {products.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => setSelectedSlug(p.slug)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition ${
                    selected?.slug === p.slug
                      ? "border-acid/50 bg-acid/5"
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-void">
                    {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{p.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-acid"
                        style={{ width: `${Math.max(4, (p.qty / maxQty) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <p className="font-medium">{p.qty} sold</p>
                    <p className="text-white/40">{formatINR(p.revenue)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected product location breakdown */}
          <div className="rounded-xl border border-line bg-ink p-4">
            <div className="mb-4 flex items-center gap-2 text-white/40">
              <MapPin size={15} />
              <span className="text-xs font-medium">
                {selected ? `Where "${selected.name}" sells` : "Select a product"}
              </span>
            </div>
            {selected && (
              <>
                <p className="mb-4 text-sm text-white/60">
                  {selected.qty} units · {formatINR(selected.revenue)} revenue ·{" "}
                  {selected.orderCount} order{selected.orderCount !== 1 ? "s" : ""}
                </p>
                <p className="mb-2 text-xs font-medium text-white/40">By state</p>
                <LocationBars
                  items={selected.topStates}
                  max={Math.max(1, ...selected.topStates.map((s) => s.qty))}
                />
                <p className="mb-2 mt-4 text-xs font-medium text-white/40">By city</p>
                <LocationBars
                  items={selected.topCities}
                  max={Math.max(1, ...selected.topCities.map((s) => s.qty))}
                />
              </>
            )}
          </div>

          {/* Overall order distribution by state */}
          <div className="rounded-xl border border-line bg-ink p-4 sm:col-span-2">
            <div className="mb-4 flex items-center gap-2 text-white/40">
              <MapPin size={15} />
              <span className="text-xs font-medium">All orders by state</span>
            </div>
            <LocationBars items={topStates} max={maxOverallState} />
          </div>
        </div>
      )}
    </div>
  );
}
