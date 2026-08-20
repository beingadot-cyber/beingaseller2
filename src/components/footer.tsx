import Link from "next/link";
import { AtSign, Mail, MapPin, ShieldCheck } from "lucide-react";
import { MarqueeRow } from "./marquee";

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink">
      {/* Giant brand marquee */}
      <div className="border-b border-line py-8 opacity-90">
        <MarqueeRow>
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="mx-8 font-display text-6xl font-extrabold tracking-tight sm:text-7xl"
            >
              <span className="text-outline">BEINGA</span>
              <span className="text-acid">SELLER</span>
              <span className="mx-8 text-outline-violet">✦</span>
            </span>
          ))}
        </MarqueeRow>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-acid font-display text-sm font-extrabold text-void">
              BS
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              BEINGA<span className="text-acid">SELLER</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
            Loud fits, zero drama. Every product hand-picked, quality-checked and
            rated 4.5 or above — or it never makes the drop.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="grid size-10 place-items-center rounded-full border border-white/10 transition-all hover:border-acid/60 hover:text-acid"
              aria-label="Instagram"
            >
              <AtSign size={16} />
            </a>
            <a
              href="mailto:support@beingaseller.in"
              className="grid size-10 place-items-center rounded-full border border-white/10 transition-all hover:border-acid/60 hover:text-acid"
              aria-label="Email"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-acid">
            Shop
          </h4>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-mist">
            <li><Link href="/products" className="transition-colors hover:text-white">All products</Link></li>
            <li><Link href="/products/midnight-aura-tee" className="transition-colors hover:text-white">Oversized tees</Link></li>
            <li><Link href="/products/neon-drip-hoodie" className="transition-colors hover:text-white">Hoodies</Link></li>
            <li><Link href="/products/cloud-walk-sneakers" className="transition-colors hover:text-white">Sneakers</Link></li>
            <li><Link href="/products/urban-sling-bag" className="transition-colors hover:text-white">Accessories</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-acid">
            Help
          </h4>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-mist">
            <li><Link href="/policies#shipping" className="transition-colors hover:text-white">Shipping policy</Link></li>
            <li><Link href="/policies#payments" className="transition-colors hover:text-white">Payments — prepaid only</Link></li>
            <li><Link href="/policies#returns" className="transition-colors hover:text-white">No-return policy</Link></li>
            <li><Link href="/policies#privacy" className="transition-colors hover:text-white">Privacy policy</Link></li>
            <li><Link href="/policies#terms" className="transition-colors hover:text-white">Terms of service</Link></li>
          </ul>
        </div>

        {/* Trust */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-acid">
            Checkout, secured
          </h4>
          <div className="mt-4 rounded-2xl border border-line bg-panel p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={16} className="text-acid" />
              100% Prepaid · PhonePe
            </div>
            <p className="mt-2 text-xs leading-relaxed text-fog">
              UPI · Cards · Netbanking. Payments encrypted end-to-end. No COD,
              no payment at your door, ever.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-fog">
              <MapPin size={12} /> Ships across India
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-fog sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Beingaseller. All rights reserved.</p>
          <p className="uppercase tracking-[0.2em]">
            Prepaid only · No COD · All sales final
          </p>
        </div>
      </div>
    </footer>
  );
}
