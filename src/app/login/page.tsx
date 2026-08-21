"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,255,0,0.06),transparent_60%)]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass rounded-3xl border border-line p-8">
          <div className="mb-8">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-acid mb-3">Customer Login</p>
            <h1 className="font-display text-3xl font-extrabold">Track Your Orders</h1>
            <p className="mt-2 text-sm text-fog">Enter your name and mobile number — no OTP, no password.</p>
          </div>
          <LoginForm onSuccess={() => router.push("/my-orders")} />
        </div>
      </motion.div>
    </div>
  );
}
