"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, LogOut, Package, PackageCheck, XCircle, Clock, MessageSquare } from "lucide-react";
import { formatINR } from "@/data/products";
import { useAuth } from "@/context/auth-context";

type OrderItem = { name: string; size: string; qty: number; price: number; image?: string };
type Order = { id: string; shortId: string; status: string; total: number; items: OrderItem[]; city: string; state: string; createdAt: string; demo: boolean };

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PAID: { label: "Confirmed", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: <PackageCheck size={14} /> },
  PENDING: { label: "Processing", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: <Clock size={14} /> },
  FAILED: { label: "Failed", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: <XCircle size={14} /> },
};

export default function MyOrdersPage() {
  const { customer, loading: authLoading, openLogin, logout: authLogout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (customer) {
      loadOrders(customer.phone);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, customer]);

  async function loadOrders(ph?: string) {
    setLoading(true); setNotFound(false);
    const params = new URLSearchParams();
    if (ph) params.set("phone", ph);
    const res = await fetch(`/api/my-orders?${params}`);
    const data = await res.json();
    setLoading(false);
    if (data.ok) { setOrders(data.orders); if (data.orders.length === 0) setNotFound(true); }
    else setNotFound(true);
  }

  async function logout() {
    await authLogout();
    setOrders([]);
  }

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,255,0,0.04),transparent_60%)]" />
      <div className="mx-auto max-w-3xl relative">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-acid mb-3">Your Orders</p>
            <h1 className="font-display text-4xl font-extrabold">Order History</h1>
            {customer && <p className="mt-2 text-sm text-fog">{customer.name} · {customer.phone}</p>}
          </div>
          {customer && (
            <button onClick={logout} className="flex items-center gap-2 text-xs text-fog hover:text-red-400 transition-colors">
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>

        {!customer && !loading && (
          <div className="glass rounded-3xl border border-line p-8 mb-8">
            <h2 className="font-display text-lg font-bold mb-2">Track by Phone</h2>
            <p className="text-sm text-fog mb-4">Enter the mobile number you used at checkout, or log in to save your order history for next time.</p>
            <div className="flex gap-3">
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" maxLength={10}
                className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-acid/60"
                onKeyDown={(e) => e.key === "Enter" && phone.length === 10 && loadOrders(phone)} />
              <button onClick={() => loadOrders(phone)} disabled={phone.length !== 10}
                className="rounded-xl bg-acid px-5 py-3 font-display text-sm font-bold text-void disabled:opacity-40 flex items-center gap-2">
                Track <ArrowRight size={14} />
              </button>
            </div>
            <div className="mt-4 text-center text-xs text-fog">— or —</div>
            <button onClick={openLogin} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-acid/30 py-3 text-sm font-semibold text-acid hover:bg-acid/5 transition-colors">
              Login →
            </button>
          </div>
        )}

        {loading && <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-acid" /></div>}

        {notFound && !loading && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto mb-4 text-fog" />
            <p className="font-display text-lg font-bold">No orders found</p>
            <p className="text-sm text-fog mt-2">Double-check your phone number.</p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
            const items = order.items as OrderItem[];
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl border border-line p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-display text-base font-bold">#{order.shortId}</div>
                    <div className="text-xs text-fog mt-1">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <div className="text-xs text-fog">{order.city}, {order.state}</div>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.color}`}>
                    {cfg.icon}{cfg.label}
                    {order.demo && <span className="ml-1 opacity-60">(demo)</span>}
                  </span>
                </div>
                <div className="divide-y divide-line">
                  {items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-fog">Size: {item.size} · Qty: {item.qty}</div>
                      </div>
                      <div className="text-sm font-bold">{formatINR(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                  <div className="text-sm font-bold">Total: <span className="text-acid">{formatINR(order.total)}</span></div>
                  {order.status === "PAID" && (
                    <Link href={`/support?orderId=${order.id}&product=${encodeURIComponent(items[0]?.name ?? "")}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-fog hover:text-acid transition-colors border border-line rounded-lg px-3 py-1.5">
                      <MessageSquare size={12} /> Support
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
