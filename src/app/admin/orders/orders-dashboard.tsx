"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Package } from "lucide-react";
import { formatINR } from "@/data/products";
import type { Order } from "@/db/schema";

type OrderItem = { slug: string; name: string; size: string; qty: number; price: number; image: string };

const STATUS_OPTIONS = ["PENDING", "PAID", "FAILED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  PAID: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  FAILED: "bg-red-500/15 text-red-300 border-red-500/30",
  SHIPPED: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  DELIVERED: "bg-acid/15 text-acid border-acid/30",
  CANCELLED: "bg-white/10 text-white/50 border-white/20",
};

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OrdersDashboard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  async function changeStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const visible = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Orders</h1>
          <p className="text-sm text-white/50">{orders.length} total</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-acid"
        >
          <option value="ALL">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-line bg-ink p-10 text-center text-white/50">
          <Package className="mx-auto mb-3 opacity-40" size={28} />
          No orders {filter !== "ALL" ? `with status ${filter}` : "yet"}.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((order) => {
            const items = (order.items as OrderItem[]) ?? [];
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="rounded-xl border border-line bg-ink">
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{order.customerName}</span>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          STATUS_STYLES[order.status] ?? "border-line text-white/60"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="truncate text-xs text-white/50">
                      {order.phone} · {items.length} item{items.length !== 1 ? "s" : ""} ·{" "}
                      {fmtDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-medium">{formatINR(order.total)}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-line p-4">
                    <div>
                      <p className="mb-1 text-xs font-medium text-white/40">Shipping to</p>
                      <p className="text-sm text-white/80">
                        {order.addressLine1}
                        {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                        {order.landmark ? ` (near ${order.landmark})` : ""}, {order.city}, {order.state}{" "}
                        {order.pincode}
                      </p>
                      <p className="mt-1 text-sm text-white/60">
                        {order.phone}
                        {order.email ? ` · ${order.email}` : ""}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium text-white/40">Items</p>
                      <div className="space-y-2">
                        {items.map((it, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/80">
                              {it.name} · {it.size} × {it.qty}
                            </span>
                            <span className="text-white/60">{formatINR(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                      <div className="text-white/60">
                        Subtotal {formatINR(order.subtotal)} · Shipping{" "}
                        {order.shipping === 0 ? "Free" : formatINR(order.shipping)}
                        {order.discount ? ` · Discount -${formatINR(order.discount)}` : ""}
                        {order.couponCode ? ` (${order.couponCode})` : ""}
                      </div>
                      <div className="font-medium">Total {formatINR(order.total)}</div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-line pt-3">
                      <span className="text-xs text-white/40">Update status:</span>
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                        className="rounded-lg border border-line bg-void px-2 py-1.5 text-sm outline-none focus:border-acid disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {updatingId === order.id && <Loader2 size={14} className="animate-spin text-white/40" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
