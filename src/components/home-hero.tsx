"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowDown, ArrowRight, ShieldCheck, Star, Truck } from "lucide-react";
import { Hero3D } from "./hero-3d";

const lineWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const line: Variants = {
  hidden: { y: "115%" },
  show: {
    y: "0%",
    transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUpLate: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HomeHero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Backdrops */}
      <div className="absolute inset-0 bg-hero-grid" />
      <div className="absolute -left-40 top-1/4 size-[34rem] rounded-full bg-viol/25 blur-[140px]" />
      <div className="absolute -right-32 bottom-0 size-[30rem] rounded-full bg-acid/12 blur-[150px]" />

      {/* 3D scene */}
      <Hero3D />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <motion.div variants={lineWrap} initial="hidden" animate="show">
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="mb-7 flex flex-wrap items-center gap-3">
            <span className="chip border-acid/40 bg-acid/10 text-acid">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-acid opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-acid" />
              </span>
              Drop 001 — Live now
            </span>
            <span className="chip">India-wide shipping</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(3.2rem,10.5vw,8.5rem)] font-extrabold leading-[0.92] tracking-tight">
            <span className="block overflow-hidden pb-1">
              <motion.span variants={line} className="block">
                DRIP THAT
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <motion.span variants={line} className="block">
                <span className="text-outline">STOPS THE</span>
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.span variants={line} className="block">
                <span className="text-acid drop-shadow-[0_0_35px_rgba(200,255,0,0.45)]">
                  SCROLL.
                </span>
              </motion.span>
            </span>
          </h1>

          {/* Subcopy */}
          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
          >
            Streetwear hand-picked for the timeline. Every piece rated{" "}
            <span className="font-semibold text-white">4.5 or above</span> — or
            it never makes the drop. 100% prepaid, shipped to your door.{" "}
            <span className="text-white">No COD. No returns. No cap.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/products" className="btn-acid text-sm">
              Shop the drop <ArrowRight size={16} />
            </Link>
            <Link href="/#lookbook" className="btn-ghost text-sm">
              Explore lookbook
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUpLate}
            className="mt-14 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {[
              {
                icon: Star,
                title: "4.5+ rated",
                sub: "or it never drops",
              },
              {
                icon: Truck,
                title: "24–48 hr",
                sub: "dispatch, always",
              },
              {
                icon: ShieldCheck,
                title: "100% prepaid",
                sub: "secure via PhonePe",
              },
            ].map((stat) => (
              <div
                key={stat.title}
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-acid/12 text-acid">
                  <stat.icon size={17} />
                </span>
                <div>
                  <p className="font-display text-sm font-bold">{stat.title}</p>
                  <p className="text-xs text-fog">{stat.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating glass cards over the 3D scene */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[7%] top-[20%] z-10 hidden animate-float-y xl:block"
      >
        <div className="glass sheen -rotate-3 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2">
            <Star size={15} className="fill-acid text-acid" />
            <span className="font-display text-lg font-extrabold">4.8</span>
          </div>
          <p className="mt-1 text-xs text-mist">Urban Sling · 389 reviews</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-[16%] right-[16%] z-10 hidden animate-float-y xl:block"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="glass rotate-6 rounded-full px-6 py-3">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-acid">
            No COD. Ever.
          </p>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#drop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-fog transition-colors hover:text-acid"
        aria-label="Scroll to products"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="grid size-9 animate-bounce place-items-center rounded-full border border-current">
          <ArrowDown size={14} />
        </span>
      </motion.a>
    </section>
  );
}
