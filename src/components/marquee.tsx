import React from "react";

export function MarqueeRow({
  children,
  fast = false,
  className = "",
}: {
  children: React.ReactNode;
  fast?: boolean;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="marquee-track"
        style={fast ? { animationDuration: "18s" } : undefined}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_ITEMS = [
  "PREPAID ONLY",
  "NO COD",
  "NO RETURNS",
  "4.5+ RATED ONLY",
  "FREE SHIPPING OVER ₹999",
  "NEW DROPS EVERY FRIDAY",
];

export function TickerStrip({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  return (
    <div className="relative -rotate-1 border-y border-black/20 bg-acid py-3 text-void shadow-[0_10px_40px_-10px_rgba(200,255,0,0.5)]">
      <MarqueeRow fast>
        {items.map((item, i) => (
          <span
            key={i}
            className="mx-6 flex items-center gap-6 font-display text-sm font-bold tracking-[0.2em]"
          >
            {item}
            <span className="text-base leading-none">✦</span>
          </span>
        ))}
      </MarqueeRow>
    </div>
  );
}
