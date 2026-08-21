"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { LoginForm } from "./login-form";

export function LoginModal() {
  const { loginModalOpen, closeLogin } = useAuth();

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void/80 backdrop-blur-md px-4"
          onClick={closeLogin}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm glass rounded-3xl border border-line p-8"
          >
            <button
              onClick={closeLogin}
              aria-label="Close"
              className="absolute right-5 top-5 grid size-8 place-items-center rounded-full border border-white/10 bg-white/5 text-fog hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-acid mb-3">Login / Sign up</p>
            <h2 className="font-display text-2xl font-extrabold mb-2">Welcome</h2>
            <p className="text-sm text-fog mb-6">Enter your name and mobile number to continue.</p>
            <LoginForm onSuccess={closeLogin} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
