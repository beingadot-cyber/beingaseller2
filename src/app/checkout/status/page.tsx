"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Home,
  Loader2,
  MapPin,
  PackageCheck,
  PartyPopper,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatINR } from "@/data/products";

type StatusResult = {
  status: "PENDING" | "PAID" | "FAILED";
  orderId: string;
  total: number;
  demo: boolean;
  customerName?: string;
  city?: string;
  state?: string;
};

function Verifying() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Loader2 size={40} className="animate-spin text-acid" />
      <p className="font-display text-xl font-bold">Verifying your payment…</p>
      <p className="text-sm text-fog">Hang tight, this takes a second.</p>
    </div>
  );
}

function StatusInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const demoFlag = params.get("demo") === "1";
  const { clear } = useCart();

  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!orderId) {
      setError("No order reference found in the URL.");
      setLoading(false);
      return;
    }

    const check = (attempt: number) => {
      fetch("/api/payment/phonepe/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, demo: demoFlag }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!data.ok) throw new Error(data.message || "Verification failed.");
          setResult(data as StatusResult);
          setLoading(false);
          if (data.status === "PAID") {
            clear(); // empty the bag on confirmed payment
          } else if (data.status === "PENDING" && attempt < 3) {
            setLoading(true);
            setTimeout(() => check(attempt + 1), 2500);
          }
        })
        .catch((e) => {
          setError(e instanceof Error ? e.message : "Could not verify payment.");
          setLoading(false);
        });
    };

    check(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, demoFlag]);

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      {loading && !result && <Verifying />}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <XCircle size={52} className="text-red-400" />
          <h1 className="font-display text-3xl font-extrabold">Could not verify</h1>
          <p className="max-w-sm text-sm text-mist">{error}</p>
          <Link href="/products" className="btn-ghost text-sm">
            Back to shop
          </Link>
        </motion.div>
      )}

      {result?.status === "PAID" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {/* Success burst */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
            className="relative mx-auto grid size-24 place-items-center rounded-full bg-acid shadow-[0_0_80px_-10px_rgba(200,255,0,0.7)]"
          >
            <Check size={44} strokeWidth={3} className="text-void" />
            <motion.span
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 rounded-full border-2 border-acid"
            />
          </motion.div>

          <p className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-acid">
            <PartyPopper size={14} /> Payment confirmed
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            ORDER <span className="text-outline">LOCKED IN</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-mist">
            {result.customerName ? `${result.customerName}, your` : "Your"} fit is
            officially on the way.{" "}
            {formatINR(result.total)} paid
            {result.demo ? " (simulated)" : ""} — receipt and tracking will hit
            your SMS inbox shortly.
          </p>

          <div className="glass mx-auto mt-8 grid max-w-md gap-0 rounded-3xl p-6 text-left">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-fog">Order ID</span>
              <span className="font-mono text-xs text-acid">
                #{result.orderId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-line py-4">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-fog">
                <PackageCheck size={14} className="text-acid" /> Status
              </span>
              <span className="rounded-full bg-acid/15 px-3 py-1 text-xs font-bold text-acid">
                PAID · PROCESSING
              </span>
            </div>
            {result.city && (
              <div className="flex items-center justify-between border-b border-line py-4">
                <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-fog">
                  <MapPin size={14} className="text-acid" /> Delivering to
                </span>
                <span className="text-sm font-semibold">
                  {result.city}, {result.state}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-4">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-fog">
                <Truck size={14} className="text-acid" /> ETA
              </span>
              <span className="text-sm font-semibold">3–7 working days</span>
            </div>
          </div>

          {result.demo && (
            <p className="mx-auto mt-4 max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[0.7rem] leading-relaxed text-fog">
              Demo mode: PhonePe credentials are not configured, so this payment
              was simulated end-to-end. Add PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY
              and PHONEPE_SALT_INDEX to the environment to accept real payments.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/products" className="btn-acid text-sm">
              Keep shopping <ArrowRight size={15} />
            </Link>
            <Link href="/" className="btn-ghost text-sm">
              <Home size={14} /> Home
            </Link>
          </div>
        </motion.div>
      )}

      {result?.status === "PENDING" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5"
        >
          <RefreshCw size={44} className="animate-spin text-acid [animation-duration:2.5s]" />
          <h1 className="font-display text-3xl font-extrabold">Still processing</h1>
          <p className="max-w-sm text-sm text-mist">
            Your bank is taking a little longer than usual. If any amount was
            debited, it reflects automatically within 24 hours or gets refunded
            by your bank.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              ran.current = false;
              setResult(null);
            }}
            className="btn-ghost text-sm"
          >
            <RefreshCw size={14} /> Check again
          </button>
        </motion.div>
      )}

      {result?.status === "FAILED" && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5"
        >
          <XCircle size={52} className="text-red-400" />
          <h1 className="font-display text-4xl font-extrabold">
            PAYMENT <span className="text-outline">BOUNCED</span>
          </h1>
          <p className="max-w-sm text-sm text-mist">
            The payment did not go through — no amount has been captured. Retry
            and your fit is still yours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/checkout" className="btn-acid text-sm">
              Retry payment <ArrowRight size={15} />
            </Link>
            <Link href="/" className="btn-ghost text-sm">Home</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <div className="relative min-h-screen overflow-hidden pt-16">
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[30rem] -translate-x-1/2 rounded-full bg-viol/15 blur-[160px]" />
      <div className="relative">
        <Suspense
          fallback={
            <div className="flex min-h-[75vh] items-center justify-center">
              <Loader2 size={36} className="animate-spin text-acid" />
            </div>
          }
        >
          <StatusInner />
        </Suspense>
      </div>
    </div>
  );
}
