"use client";
import { useState } from "react";
import { ArrowRight, Loader2, Phone, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    if (name.trim().length < 2) { setError("Please enter your name."); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError("Enter a valid 10-digit mobile number."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.message || "Could not log in."); return; }
      await refresh();
      onSuccess?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-fog mb-2">Full Name</label>
        <div className="relative">
          <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-line bg-panel pl-11 pr-4 py-3.5 text-sm outline-none focus:border-acid/60 transition-colors"
            autoComplete="name"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-fog mb-2">Mobile Number</label>
        <div className="relative">
          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
          <input
            type="tel" inputMode="numeric" value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
            maxLength={10}
            className="w-full rounded-xl border border-line bg-panel pl-11 pr-4 py-3.5 text-sm outline-none focus:border-acid/60 transition-colors"
            autoComplete="tel"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading || !name || phone.length !== 10}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-acid py-3.5 font-display text-sm font-bold text-void disabled:opacity-50 transition-opacity"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Login</span><ArrowRight size={16} /></>}
      </button>
      <p className="text-center text-[0.65rem] leading-relaxed text-fog">
        No password, no OTP — just your name and number. We'll use this to show your order history.
      </p>
    </form>
  );
}
