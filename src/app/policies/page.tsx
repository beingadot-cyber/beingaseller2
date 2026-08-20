import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CreditCard,
  HelpCircle,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Policies",
  description:
    "Shipping, prepaid payments, no-return policy, privacy and terms for Beingaseller.",
};

const SECTIONS: {
  id: string;
  icon: LucideIcon;
  title: string;
  points: string[];
}[] = [
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments — 100% prepaid",
    points: [
      "Every order on Beingaseller is prepaid. We do not offer Cash on Delivery (COD) on any product, in any pincode.",
      "Payments are processed securely through PhonePe — you can pay with UPI, credit & debit cards, or netbanking.",
      "All payment data is encrypted end-to-end (256-bit, PCI-DSS compliant). We never see or store your card or UPI credentials.",
      "An order is confirmed only after successful payment. Unpaid or abandoned checkouts are automatically cancelled.",
      "If a payment fails after money is debited, your bank automatically reverses it within 3–5 working days.",
    ],
  },
  {
    id: "shipping",
    icon: Truck,
    title: "Shipping & delivery",
    points: [
      "Orders are dispatched within 24–48 hours of payment confirmation, Monday to Saturday.",
      "Delivery takes 3–7 working days depending on your pincode. Metro cities are usually faster.",
      "Shipping is a flat ₹49 per order — and completely free on orders of ₹999 or above.",
      "Every shipment includes live tracking. Your tracking link is shared by SMS (and email if provided) the moment your package leaves the warehouse.",
      "We currently ship across serviceable pincodes in India only.",
      "Please double-check your delivery address and mobile number at checkout — this exact information is used to ship your order.",
    ],
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "No-return policy — all sales final",
    points: [
      "All sales on Beingaseller are final. We do not accept returns, exchanges or size swaps.",
      "We are able to run this lean model (and keep prices low) because every product listed is rated 4.5 stars or above and quality-checked before dispatch.",
      "Size guidance is provided on each product page — please check it carefully before ordering.",
      "Exception: if your product arrives damaged or incorrect, raise a claim within 48 hours of delivery with a clear unboxing video. Verified claims receive a replacement or full refund, at our discretion.",
      "Claims without an unboxing video cannot be processed — always film your unboxing.",
    ],
  },
  {
    id: "privacy",
    icon: ShieldCheck,
    title: "Privacy",
    points: [
      "We collect only what is needed to deliver your order: your name, mobile number, delivery address, and optionally your email.",
      "Your details are used solely for order fulfilment, delivery updates and support — never sold or shared with advertisers.",
      "Payment information is handled entirely by PhonePe; none of it touches our servers.",
      "You can request deletion of your stored details any time after delivery by writing to us.",
    ],
  },
  {
    id: "terms",
    icon: ScrollText,
    title: "Terms of service",
    points: [
      "By placing an order you confirm you are 18+ or shopping under adult supervision, and that the details provided are accurate.",
      "Product images are shot to represent items as accurately as possible; minor colour variation due to screen settings is normal.",
      "Prices, drops and offers can change at any time without notice. Once drop stock is gone, restocks are not promised.",
      "We reserve the right to cancel orders flagged for suspicious activity; any amount paid for a cancelled order is refunded in full.",
      "These terms are governed by the laws of India. Any disputes fall under the jurisdiction of Indian courts.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <div className="relative pt-16">
      <div className="pointer-events-none absolute -top-20 left-1/3 size-[26rem] rounded-full bg-viol/12 blur-[160px]" />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* Header */}
        <div className="mb-14">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-acid">
            <span className="inline-block size-1.5 rounded-full bg-acid" />
            The fine print, minus the boring
          </p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
            STORE <span className="text-outline">POLICIES</span>
          </h1>
          <p className="mt-4 max-w-xl text-mist">
            Straight answers on how Beingaseller works. Last updated February
            2026.
          </p>
        </div>

        {/* Quick nav */}
        <div className="mb-14 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="chip transition-colors hover:border-acid/50 hover:text-white"
            >
              <s.icon size={12} className="text-acid" />
              {s.title.split("—")[0]}
            </a>
          ))}
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">
          {SECTIONS.map((s, idx) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-3xl border border-line bg-panel p-7 sm:p-9"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-acid/12 text-acid">
                  <s.icon size={20} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-fog">
                    0{idx + 1}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
                    {s.title}
                  </h2>
                </div>
              </div>
              <ul className="mt-6 flex flex-col gap-3.5">
                {s.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-mist">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-acid" />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Contact */}
        <section className="mt-10 rounded-3xl border border-acid/25 bg-gradient-to-r from-acid/10 via-panel to-viol/12 p-8 text-center">
          <HelpCircle size={26} className="mx-auto text-acid" />
          <h2 className="mt-4 font-display text-2xl font-extrabold">
            Still got questions?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-mist">
            Write to{" "}
            <a
              href="mailto:support@beingaseller.in"
              className="font-semibold text-acid underline underline-offset-4"
            >
              support@beingaseller.in
            </a>{" "}
            with your order ID — replies within 24 hours, Monday to Saturday.
          </p>
          <div className="mt-6">
            <Link href="/products" className="btn-acid text-sm">
              Back to the drop <ArrowRight size={15} />
            </Link>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-[0.65rem] uppercase tracking-[0.25em] text-fog">
            <Ban size={11} /> No COD · No returns · Prepaid only
          </p>
        </section>
      </div>
    </div>
  );
}
