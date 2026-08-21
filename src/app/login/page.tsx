"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");

  async function sendOtp() {
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    setLoading(false);
    if (!data.ok) { setError(data.message); return; }
    if (data.dev_otp) setDevOtp(data.dev_otp); // dev mode
    setStep("otp");
  }

  async function verifyOtp() {
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) });
    const data = await res.json();
    setLoading(false);
    if (!data.ok) { setError(data.message); return; }
    router.push("/my-orders");
  }

  return (
    <div className="relative min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,255,0,0.06),transparent_60%)]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass rounded-3xl border border-line p-8">
          <div className="mb-8">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-acid mb-3">Customer Login</p>
            <h1 className="font-display text-3xl font-extrabold">Track Your Orders</h1>
            <p className="mt-2 text-sm text-fog">Enter your email — we'll send a one-time code. No password needed.</p>
          </div>

          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-fog mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-line bg-panel pl-11 pr-4 py-3.5 text-sm outline-none focus:border-acid/60 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  />
                </div>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button onClick={sendOtp} disabled={loading || !email} className="w-full flex items-center justify-center gap-2 rounded-xl bg-acid py-3.5 font-display text-sm font-bold text-void disabled:opacity-50 transition-opacity">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-fog">Code sent to <span className="text-white font-semibold">{email}</span></p>
              {devOtp && <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-400">Dev mode OTP: <strong>{devOtp}</strong></div>}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-fog mb-2">6-Digit OTP</label>
                <input
                  type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" maxLength={6}
                  className="w-full rounded-xl border border-line bg-panel px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-acid/60 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && otp.length === 6 && verifyOtp()}
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="w-full flex items-center justify-center gap-2 rounded-xl bg-acid py-3.5 font-display text-sm font-bold text-void disabled:opacity-50 transition-opacity">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ShieldCheck size={16} /><span>Verify & Login</span></>}
              </button>
              <button onClick={() => { setStep("email"); setOtp(""); setError(""); }} className="w-full text-center text-xs text-fog hover:text-white transition-colors">
                ← Use different email
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
