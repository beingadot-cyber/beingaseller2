import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  BadgeCheck,
  Quote,
  ShieldCheck,
  Star,
} from "lucide-react";
import { HomeHero } from "@/components/home-hero";
import { TickerStrip } from "@/components/marquee";
import { ProductCard } from "@/components/product-card";
import { RatingStars } from "@/components/rating-stars";
import { Reveal } from "@/components/reveal";
import { listActiveProducts } from "@/db/products-repo";

/* ─────────────────────────── Section heading ─────────────────────────── */
function SectionHeading({
  eyebrow,
  title,
  outline,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  outline?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <Reveal>
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-acid">
          <span className="inline-block size-1.5 rounded-full bg-acid" />
          {eyebrow}
        </p>
        <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          {title}{" "}
          {outline && <span className="text-outline block sm:inline">{outline}</span>}
        </h2>
      </Reveal>
      {href && linkLabel && (
        <Reveal delay={0.15}>
          <Link
            href={href}
            className="group flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.15em] text-mist transition-colors hover:text-acid"
          >
            {linkLabel}
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      )}
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */
export default async function HomePage() {
  const products = await listActiveProducts();
  return (
    <>
      <HomeHero />

      <div className="relative z-10 -mt-6">
        <TickerStrip />
      </div>

      {/* ── The Drop ─────────────────────────────── */}
      <section id="drop" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 size-[28rem] -translate-x-1/2 rounded-full bg-viol/10 blur-[160px]" />
        <SectionHeading
          eyebrow="Drop 001 · Hand-picked"
          title="THE CURRENT"
          outline="DROP"
          href="/products"
          linkLabel="View all"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(3).map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i + 3} />
          ))}
        </div>
      </section>

      {/* ── Lookbook ─────────────────────────────── */}
      <section id="lookbook" className="relative border-y border-line bg-ink py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Lookbook · AI editorial"
            title="SHOT FOR"
            outline="THE FEED"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                src: "/editorial/look-hoodie.png",
                tag: "Look 01",
                caption: "Neon Drip Hoodie × Street Utility Cargo",
              },
              {
                src: "/editorial/look-duo.png",
                tag: "Look 02",
                caption: "Midnight Aura Tee × Cloud Walk Sneakers",
              },
            ].map((look, i) => (
              <Reveal key={look.src} delay={i * 0.15}>
                <Link
                  href="/products"
                  className={`group relative block overflow-hidden rounded-3xl border border-line ${
                    i === 1 ? "md:mt-20" : ""
                  }`}
                >
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={look.src}
                      alt={look.caption}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  </div>
                  <div className="absolute left-5 top-5">
                    <span className="glass rounded-full px-4 py-1.5 font-display text-[0.65rem] font-bold uppercase tracking-[0.25em] text-acid">
                      {look.tag}
                    </span>
                  </div>
                  <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                    <p className="font-display text-lg font-bold leading-tight sm:text-xl">
                      {look.caption}
                    </p>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-acid text-void transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── No-cap policy bento ──────────────────── */}
      <section id="policy" className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-20 size-[24rem] rounded-full bg-acid/8 blur-[160px]" />
        <SectionHeading
          eyebrow="Read before you cop"
          title="THE NO-CAP"
          outline="POLICY"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Prepaid only",
              body: "Every order is paid securely online via PhonePe — UPI, cards or netbanking — before it ships. Locked in, no loopholes.",
              big: true,
            },
            {
              icon: Ban,
              title: "No COD",
              body: "We never offer cash on delivery. No door-step negotiations, no fake orders, no wasted shipments.",
            },
            {
              icon: BadgeCheck,
              title: "All sales final",
              body: "No returns, no exchanges. Each piece is quality-checked against a 4.5+ bar before dispatch — check the size chart, then cop.",
            },
          ].map((card, i) => (
            <Reveal
              key={card.title}
              delay={i * 0.12}
              className={card.big ? "lg:col-span-1 md:col-span-2 lg:row-span-1" : ""}
            >
              <div className="sheen group relative h-full rounded-3xl border border-line bg-panel p-8 transition-colors duration-300 hover:border-acid/40">
                <span className="grid size-13 w-13 place-items-center rounded-2xl bg-acid/12 text-acid transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
                  <card.icon size={22} />
                </span>
                <h3 className="mt-6 font-display text-2xl font-extrabold tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  {card.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Rating bar */}
        <Reveal delay={0.2} className="mt-6">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-acid/25 bg-gradient-to-r from-acid/10 via-panel to-viol/15 px-8 py-8 sm:flex-row">
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-acid font-display text-xl font-extrabold text-void">
                4.6
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <RatingStars rating={4.6} size={16} />
                </div>
                <p className="mt-1 text-sm text-mist">
                  Average rating across every product we list
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 px-6 py-3">
              <Star size={16} className="fill-acid text-acid" />
              <span className="text-sm font-semibold uppercase tracking-[0.15em]">
                Below 4.5? It gets dropped.
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Reviews ──────────────────────────────── */}
      <section id="reviews" className="relative border-y border-line bg-ink py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Receipts" title="THE TIMELINE" outline="APPROVES" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Aarav · 19",
                city: "New Delhi",
                rating: 4.7,
                text: "Ordered the Aura tee on Tuesday, wearing it by Friday. The print is even louder in person. 10/10 would get stopped on campus again.",
                item: "Midnight Aura Tee",
              },
              {
                name: "Myra · 23",
                city: "Bengaluru",
                rating: 4.8,
                text: "The sling bag fits my entire life. Quality genuinely shocked me for the price — zips glide, stitching is clean, zero loose threads.",
                item: "Urban Sling Bag",
              },
              {
                name: "Kabir · 21",
                city: "Pune",
                rating: 4.6,
                text: "Cloud Walks feel like walking on foam. Sized up half as suggested and the fit is perfect. Prepaid checkout took like 20 seconds.",
                item: "Cloud Walk Sneakers",
              },
            ].map((review, i) => (
              <Reveal key={review.name} delay={i * 0.12}>
                <figure className="sheen flex h-full flex-col rounded-3xl border border-line bg-panel p-7">
                  <Quote size={26} className="text-acid/50" />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-mist">
                    {review.text}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-line pt-5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-display text-sm font-bold">
                          {review.name}
                        </p>
                        <p className="text-xs text-fog">
                          {review.city} · bought {review.item}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <RatingStars rating={review.rating} />
                        <span className="text-xs font-semibold text-acid">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────── */}
      <section className="relative overflow-hidden py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-viol/20 blur-[160px]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-acid">
              Drop 001 closes soon
            </p>
            <h2 className="font-display text-[clamp(2.6rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-tight">
              STOP SCROLLING.
              <span className="text-outline-acid block">START COPPING.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-mist">
              Six pieces. Rated 4.5 and above. Prepaid, packed and at your door
              in days — before the algorithm moves on.
            </p>
            <div className="mt-10">
              <Link href="/products" className="btn-acid text-sm">
                Shop all six <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
