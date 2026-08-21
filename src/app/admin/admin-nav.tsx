"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const TABS = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/complaints", label: "Complaints" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 pt-6 sm:px-6">
      <div className="flex gap-1 rounded-lg border border-line bg-ink p-1">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                active ? "bg-acid text-black" : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-white/60 hover:text-white"
      >
        <LogOut size={15} /> Log out
      </button>
    </div>
  );
}
