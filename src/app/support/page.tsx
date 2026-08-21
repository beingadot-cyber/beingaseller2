"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Star } from "lucide-react";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n)}>
          <Star size={24} className={`transition-colors ${n <= (hover || value) ? "fill-acid text-acid" : "text-fog"}`} />
        </button>
      ))}
    </div>
  );
}

function SupportForm() {
  const params = useSearchParams();
  const [form, setForm] = useState({
    customerName: "", email: "", phone: "", productName: params.get("product") ?? "",
    rating: 5, comment: "", location: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const orderId = params.get("orderId");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const res = await fetch("/api/complaints", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orderId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!data.ok) { setError(data.message); return; }
    setDone(true);
  }

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
      <CheckCircle size={56} className="mx-auto mb-4 text-green-400" />
      <h2 className="font-display text-2xl font-bold mb-2">Submitted!</h2>
      <p className="text-fog text-sm">We'll reach out to you within 24 hours.</p>
    </motion.div>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[["customerName","Full Name","Your full name"],["email","Email","your@email.com"],["phone","Mobile Number","10-digit mobile"],["location","Location","City, State"]].map(([key, label, ph]) => (
          <div key={key}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-fog mb-2">{label}</label>
            <input value={(form as Record<string,unknown>)[key] as string} onChange={set(key)} placeholder={ph} required
              className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-acid/60 transition-colors" />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-fog mb-2">Product</label>
        <input value={form.productName} onChange={set("productName")} placeholder="Product you need support for" required
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-acid/60 transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-fog mb-2">Rating</label>
        <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-fog mb-2">
          Comment <span className="text-fog normal-case font-normal">({form.comment.length}/120)</span>
        </label>
        <textarea value={form.comment} onChange={set("comment")} maxLength={120} rows={3} placeholder="Tell us what happened (max 120 characters)..." required
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-acid/60 transition-colors resize-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-acid py-3.5 font-display text-sm font-bold text-void disabled:opacity-50">
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Support Request"}
      </button>
    </form>
  );
}

export default function SupportPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,255,0,0.04),transparent_60%)]" />
      <div className="mx-auto max-w-2xl relative">
        <div className="mb-10">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-acid mb-3">Help Center</p>
          <h1 className="font-display text-4xl font-extrabold">Customer Support</h1>
          <p className="mt-2 text-sm text-fog">Share your experience or raise a concern. We respond within 24 hours.</p>
        </div>
        <div className="glass rounded-3xl border border-line p-8">
          <Suspense fallback={<Loader2 className="animate-spin" />}>
            <SupportForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
