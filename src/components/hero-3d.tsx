"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("./hero-3d-scene"), {
  ssr: false,
  loading: () => null,
});

export function Hero3D() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <HeroScene />
    </div>
  );
}
