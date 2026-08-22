"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Loader2,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import {
  formatINR,
  shippingFor,
} from "@/data/products";
import { useProducts } from "@/context/products-context";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Jammu & Kashmir", "Ladakh", "Puducherry",
  "Chandigarh", "Andaman & Nicobar",
];

type FormState = {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CheckoutPage() {
  const { items, hydrated, subtotal } = useCart();
  const { getProduct } = useProducts();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [phase, setPhase] = useState<"form" | "processing">("form");
  const [phaseText, setPhaseText] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponShipping, setCouponShipping] = useState<number | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const shipping = couponShipping ?? shippingFor(subtotal);
  const total = Math.max(subtotal + shipping - discount, 0);

  async function applyCoupon() {
    setCouponError("");
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          subtotal,
          items: items.map((it) => {
            const p = getProduct(it.slug);
            return { price: p?.price ?? 0, qty: it.qty };
          }),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setCouponError(data.message || "Invalid coupon code.");
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponShipping(null);
        return;
      }
      setAppliedCoupon(data.code);
      setDiscount(data.discount);
      setCouponShipping(data.shipping);
    } catch {
      setCouponError("Could not apply coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponShipping(null);
    setCouponInput("");
    setCouponError("");
  }

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  function validate(): boolean {
    const er: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 3) er.name = "Full name required";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) er.phone = "Valid 10-digit mobile";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      er.email = "Invalid email";
    if (form.addressLine1.trim().length < 5) er.addressLine1 = "Full address required";
    if (form.city.trim().length < 2) er.city = "City required";
    if (!form.state) er.state = "Select state";
    if (!/^\d{6}$/.test(form.pincode.trim())) er.pincode = "6-digit pincode";
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  async function handlePay() {
    setServerError(null);
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setPhase("processing");
    try {
      /* 1 — Create the order */
      setPhaseText("Locking in your order…");
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            email: form.email || undefined,
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2 || undefined,
            landmark: form.landmark || undefined,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
          items: items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })),
          couponCode: appliedCoupon || undefined,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.ok) {
        throw new Error(orderData.message || "Could not create your order.");
      }

      /* 2 — Initiate PhonePe payment */
      setPhaseText("Contacting PhonePe…");
      const payRes = await fetch("/api/payment/phonepe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });
      const payData = await payRes.json();
      if (!payRes.ok || !payData.ok) {
        throw new Error(payData.message || "Could not start the payment.");
      }

      if (payData.mode === "demo") {
        setDemoNotice(true);
        setPhaseText("Demo mode — simulating payment…");
        await new Promise((r) => setTimeout(r, 1400));
      } else if (payData.mode === "free") {
        setPhaseText("Coupon applied — order confirmed…");
        await new Promise((r) => setTimeout(r, 900));
      } else {
        setPhaseText("Redirecting to secure payment…");
      }

      window.location.href = payData.url;
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("form");
    }
  }

  /* ── Loading shell while cart hydrates ── */
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="size-10 animate-spin rounded-full border-2 border-acid border-t-transparent" />
      </div>
    );
  }

  /* ── Empty cart guard ── */
  if (items.length === 0) {
    return (
      <div className="relative min-h-screen pt-16">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
          <span className="grid size-20 place-items-center rounded-full border border-line bg-panel text-fog">
            <ShoppingBag size={30} />
          </span>
          <h1 className="font-display text-3xl font-extrabold">
            Your bag is empty
          </h1>
          <p className="text-mist">
            Add something from the drop before heading to checkout.
          </p>
          <Link href="/products" className="btn-acid text-sm">
            Shop the drop <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden pt-16">
      <div className="pointer-events-none absolute -top-24 right-1/4 size-[28rem] rounded-full bg-acid/8 blur-[160px]" />

      {/* Processing overlay */}
      <AnimatePresence>
        {phase === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-void/95 backdrop-blur-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              className="size-14 rounded-full border-2 border-acid border-t-transparent"
            />
            <p className="font-display text-lg font-bold">{phaseText}</p>
            {demoNotice && (
              <p className="max-w-sm text-center text-xs leading-relaxed text-fog">
                PhonePe keys are not configured yet, so this payment is being
                simulated. Add your merchant credentials to go fully live.
              </p>
            )}
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-fog">
              <Lock size={12} /> Do not close this tab
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-acid">
            <span className="inline-block size-1.5 rounded-full bg-acid" />
            Step 02 · Details & payment
          </p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            CHECK<span className="text-outline">OUT</span>
          </h1>
        </div>

        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-start gap-3 rounded-2xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300"
          >
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            {serverError}
          </motion.div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* ── Form ─────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Contact */}
            <section className="rounded-3xl border border-line bg-panel p-6 sm:p-8">
              <h2 className="flex items-center gap-2.5 font-display text-lg font-extrabold uppercase tracking-tight">
                <User size={17} className="text-acid" /> Contact details
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    Full name *
                  </label>
                  <input
                    className="field"
                    placeholder="e.g. Aarav Sharma"
                    value={form.name}
                    onChange={set("name")}
                    autoComplete="name"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    Mobile number *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
                    <input
                      className="field !pl-11"
                      placeholder="10-digit mobile"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setForm((f) => ({ ...f, phone: v }));
                        setErrors((er) => ({ ...er, phone: undefined }));
                      }}
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    Email <span className="text-fog">(optional — for order updates)</span>
                  </label>
                  <input
                    className="field"
                    placeholder="you@example.com"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="rounded-3xl border border-line bg-panel p-6 sm:p-8">
              <h2 className="flex items-center gap-2.5 font-display text-lg font-extrabold uppercase tracking-tight">
                <MapPin size={17} className="text-acid" /> Delivery address
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    Address line 1 *
                  </label>
                  <input
                    className="field"
                    placeholder="House no., building, street"
                    value={form.addressLine1}
                    onChange={set("addressLine1")}
                    autoComplete="address-line1"
                  />
                  {errors.addressLine1 && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.addressLine1}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    Address line 2
                  </label>
                  <input
                    className="field"
                    placeholder="Area, locality (optional)"
                    value={form.addressLine2}
                    onChange={set("addressLine2")}
                    autoComplete="address-line2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    Landmark
                  </label>
                  <input
                    className="field"
                    placeholder="Near… (optional)"
                    value={form.landmark}
                    onChange={set("landmark")}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    City *
                  </label>
                  <input
                    className="field"
                    placeholder="City"
                    value={form.city}
                    onChange={set("city")}
                    autoComplete="address-level2"
                  />
                  {errors.city && <p className="mt-1.5 text-xs text-red-400">{errors.city}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    Pincode *
                  </label>
                  <input
                    className="field"
                    placeholder="6-digit"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setForm((f) => ({ ...f, pincode: v }));
                      setErrors((er) => ({ ...er, pincode: undefined }));
                    }}
                    autoComplete="postal-code"
                  />
                  {errors.pincode && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.pincode}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-mist">
                    State *
                  </label>
                  <select className="field" value={form.state} onChange={set("state")}>
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="mt-1.5 text-xs text-red-400">{errors.state}</p>}
                </div>
              </div>

              <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-line bg-ink p-4 text-xs leading-relaxed text-mist">
                <Ban size={14} className="mt-0.5 shrink-0 text-acid" />
                Double-check your address — this exact address is used for
                delivery, and all sales are final (no returns or exchanges).
              </div>
            </section>
          </div>

          {/* ── Summary ──────────────────────── */}
          <aside className="h-fit rounded-3xl border border-line bg-panel p-7 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">
              Your order
            </h2>

            <ul className="mt-5 flex max-h-64 flex-col gap-4 overflow-y-auto pr-1">
              {items.map((item) => {
                const p = getProduct(item.slug);
                if (!p) return null;
                return (
                  <li key={`${item.slug}-${item.size}`} className="flex items-center gap-3.5">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-panel-2">
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                      <span className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-acid font-display text-[0.6rem] font-bold text-void">
                        {item.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-fog">Size · {item.size}</p>
                    </div>
                    <p className="font-display text-sm font-bold">
                      {formatINR(p.price * item.qty)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm">
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
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-acid">Coupon ({appliedCoupon})</dt>
                  <dd className="font-semibold text-acid">-{formatINR(discount)}</dd>
                </div>
              )}
            </dl>

            {/* Coupon code */}
            <div className="mt-5 border-t border-line pt-5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl border border-acid/30 bg-acid/5 px-4 py-3">
                  <span className="text-xs font-semibold text-acid">
                    &ldquo;{appliedCoupon}&rdquo; applied
                  </span>
                  <button onClick={removeCoupon} className="text-xs text-fog hover:text-white transition-colors">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className="field flex-1 !py-2.5 text-sm uppercase"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="shrink-0 rounded-xl border border-line px-4 text-xs font-bold uppercase tracking-wider text-mist hover:border-acid/60 hover:text-acid transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-2 text-xs text-red-400">{couponError}</p>}
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-sm uppercase tracking-[0.2em] text-mist">Total</span>
              <span className="font-display text-3xl font-extrabold text-acid">
                {formatINR(total)}
              </span>
            </div>

            <motion.button
              onClick={handlePay}
              whileTap={{ scale: 0.98 }}
              disabled={phase === "processing"}
              className="btn-acid mt-7 w-full justify-center text-sm disabled:opacity-60"
            >
              {phase === "processing" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Lock size={15} />
              )}
              {total === 0 ? "Place free order" : `Pay ${formatINR(total)} securely`}
            </motion.button>

            <div className="mt-5 flex flex-col gap-2.5 rounded-2xl border border-line bg-ink p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-white">
                <ShieldCheck size={14} className="text-acid" />
                Powered by PhonePe
              </p>
              <p className="text-xs leading-relaxed text-fog">
                UPI · Credit & debit cards · Netbanking. 256-bit encrypted,
                PCI-DSS compliant. We never see your payment details.
              </p>
            </div>

            <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-fog">
              By paying you agree to our{" "}
              <Link href="/policies" className="text-mist underline underline-offset-2 hover:text-acid">
                prepaid-only & all-sales-final policy
              </Link>
              .
            </p>

            <Link
              href="/cart"
              className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist transition-colors hover:text-acid"
            >
              <ArrowLeft size={13} /> Back to bag
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
