"use client";

import { useState } from "react";
import { Loader2, MessageSquareWarning, Star } from "lucide-react";
import type { Complaint } from "@/db/schema";

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-red-500/15 text-red-300 border-red-500/30",
  IN_PROGRESS: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  RESOLVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ComplaintsDashboard({ initialComplaints }: { initialComplaints: Complaint[] }) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  async function changeStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.ok) {
        setComplaints((prev) => prev.map((c) => (c.id === id ? data.complaint : c)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const visible = filter === "ALL" ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Complaints</h1>
          <p className="text-sm text-white/50">{complaints.length} total</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-acid"
        >
          <option value="ALL">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-line bg-ink p-10 text-center text-white/50">
          <MessageSquareWarning className="mx-auto mb-3 opacity-40" size={28} />
          No complaints {filter !== "ALL" ? `with status ${filter.replace("_", " ")}` : "yet"}.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((c) => (
            <div key={c.id} className="rounded-xl border border-line bg-ink p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.customerName}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        STATUS_STYLES[c.status] ?? "border-line text-white/60"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    {c.phone}
                    {c.email ? ` · ${c.email}` : ""} · {fmtDate(c.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < c.rating ? "fill-acid text-acid" : "text-white/20"}
                    />
                  ))}
                </div>
              </div>

              <p className="mb-1 text-sm text-white/80">
                <span className="text-white/40">Product:</span> {c.productName}
              </p>
              {c.location && (
                <p className="mb-1 text-sm text-white/60">
                  <span className="text-white/40">Location:</span> {c.location}
                </p>
              )}
              {c.comment && <p className="mb-3 text-sm text-white/80">&ldquo;{c.comment}&rdquo;</p>}

              <div className="flex items-center gap-2 border-t border-line pt-3">
                <span className="text-xs text-white/40">Update status:</span>
                <select
                  value={c.status}
                  disabled={updatingId === c.id}
                  onChange={(e) => changeStatus(c.id, e.target.value)}
                  className="rounded-lg border border-line bg-void px-2 py-1.5 text-sm outline-none focus:border-acid disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                {updatingId === c.id && <Loader2 size={14} className="animate-spin text-white/40" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
