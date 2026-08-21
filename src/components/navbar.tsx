"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Package, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "./cart-provider";

const LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/#lookbook", label: "Lookbook" },
  { href: "/#policy", label: "No-Cap Policy" },
  { href: "/my-orders", label: "My Orders" },
];

export function Navbar() {
  const { count, setOpen, hydrated } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<{ email: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.ok && d.customer) setCustomer(d.customer);
    }).catch(() => {});
  }, [pathname]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "glass shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]" : "bg-transparent"}`}>
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-acid font-display text-sm font-extrabold text-void transition-transform duration-300 group-hover:rotate-12">BS</span>
            <span className="font-display text-lg font-extrabold tracking-tight">BEINGA<span className="text-acid">SELLER</span></span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="group relative text-[0.8rem] font-medium uppercase tracking-[0.18em] text-mist transition-colors hover:text-white">
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-acid transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href={customer ? "/my-orders" : "/login"}
              className="group relative grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-acid/60 hover:bg-acid/10"
              aria-label="Account">
              <User size={18} className="transition-transform group-hover:scale-110" />
              {customer && <span className="absolute -right-1 -top-1 size-3 rounded-full bg-acid border-2 border-void" />}
            </Link>
            <button onClick={() => setOpen(true)} className="group relative grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-acid/60 hover:bg-acid/10" aria-label="Open cart">
              <ShoppingBag size={18} className="transition-transform group-hover:scale-110" />
              <AnimatePresence>
                {hydrated && count > 0 && (
                  <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-acid font-display text-[0.65rem] font-bold text-void">
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button onClick={() => setMenuOpen((v) => !v)} className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 md:hidden" aria-label="Toggle menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="glass overflow-hidden md:hidden">
              <div className="flex flex-col gap-1 px-6 py-4">
                {LINKS.map((link) => (
                  <Link key={link.label} href={link.href} className="rounded-lg px-3 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:bg-white/5 hover:text-acid">
                    {link.label}
                  </Link>
                ))}
                <Link href={customer ? "/my-orders" : "/login"} className="rounded-lg px-3 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:bg-white/5 hover:text-acid">
                  {customer ? "My Account" : "Login"}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
