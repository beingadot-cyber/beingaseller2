"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { formatINR } from "@/data/products";
import type { AdminProduct } from "@/db/products-repo";

const CATEGORIES = ["Tees", "Bottoms", "Sneakers", "Hoodies", "Jackets", "Accessories"];

type FormState = {
  meeshoUrl?: string;
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  price: string;
  mrp: string;
  sourcingPrice: string;
  sourcingRef: string;
  productId: string;
  rating: string;
  reviews: string;
  image: string;
  images: string[];
  video: string;
  accent: string;
  sizes: string;
  description: string;
  highlights: string;
  fabric: string;
  dispatch: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  meeshoUrl: "",
  slug: "",
  name: "",
  tagline: "",
  category: "Tees",
  price: "",
  mrp: "",
  sourcingPrice: "",
  sourcingRef: "",
  productId: "",
  rating: "4.5",
  reviews: "0",
  image: "",
  images: [],
  video: "",
  accent: "#c8ff00",
  sizes: "S, M, L, XL, XXL",
  description: "",
  highlights: "",
  fabric: "",
  dispatch: "Ships in 7–10 days",
  active: true,
};

function productToForm(p: AdminProduct): FormState {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    price: String(p.price),
    mrp: String(p.mrp),
    sourcingPrice: String(p.sourcingPrice ?? ""),
    sourcingRef: p.sourcingRef ?? "",
    productId: p.productId ?? "",
    rating: String(p.rating),
    reviews: String(p.reviews),
    image: p.image,
    images: p.images && p.images.length ? p.images : p.image ? [p.image] : [],
    video: p.video ?? "",
    accent: p.accent,
    sizes: p.sizes.join(", "),
    description: p.description,
    highlights: p.highlights.join("\n"),
    fabric: p.fabric,
    dispatch: p.dispatch,
    active: p.active,
  };
}

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminDashboard({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [meeshoUrl, setMeeshoUrl] = useState("");

  async function scrapeFromMeesho(url: string) {
    if (!url || !url.includes("meesho.com")) { setError("Please enter a valid Meesho URL"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/meesho-scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (!data.ok) { setError(data.message); setSaving(false); return; }
      const p = data.product;
      setForm((f) => f ? { ...f, name: p.name, slug: p.slug, tagline: p.tagline, description: p.description, image: p.image, images: p.image ? [p.image] : f.images, price: String(p.price), mrp: String(p.mrp), sourcingPrice: String(p.sourcingPrice), sourcingRef: p.sourcingRef, sizes: p.sizes.join(", "), fabric: p.fabric, category: p.category, rating: String(p.rating), reviews: String(p.reviews), meeshoUrl: p.meeshoUrl } : f);
      setMeeshoUrl("");
    } catch { setError("Scrape failed — fill manually."); }
    finally { setSaving(false); }
  }

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setError("");
    setPasteUrl("");
  }

  function openEdit(p: AdminProduct) {
    setForm(productToForm(p));
    setError("");
    setPasteUrl("");
  }

  function closeForm() {
    setForm(null);
    setError("");
    setPasteUrl("");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !form) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.ok) uploaded.push(data.url);
        else setError(data.message || "One or more images failed to upload.");
      }
      setForm((f) => {
        if (!f) return f;
        const images = [...f.images, ...uploaded];
        return { ...f, images, image: f.image || images[0] || "" };
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeGalleryImage(url: string) {
    setForm((f) => {
      if (!f) return f;
      const images = f.images.filter((u) => u !== url);
      return { ...f, images, image: f.image === url ? images[0] ?? "" : f.image };
    });
  }

  function setCoverImage(url: string) {
    setForm((f) => (f ? { ...f, image: url } : f));
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploadingVideo(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) setError(data.message || "Video upload failed.");
      else setForm((f) => (f ? { ...f, video: data.url } : f));
    } catch {
      setError("Video upload failed. Please try again.");
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError("");
    const body = {
      slug: form.slug || slugify(form.name),
      name: form.name,
      tagline: form.tagline,
      category: form.category,
      price: Number(form.price),
      mrp: Number(form.mrp),
      sourcingPrice: Number(form.sourcingPrice) || 0,
      sourcingRef: form.sourcingRef,
      productId: form.productId,
      rating: Number(form.rating) || 4.5,
      reviews: Number(form.reviews) || 0,
      image: form.image,
      images: form.images,
      video: form.video,
      accent: form.accent,
      sizes: form.sizes,
      description: form.description,
      highlights: form.highlights,
      fabric: form.fabric,
      dispatch: form.dispatch,
      active: form.active,
    };

    try {
      const url = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Could not save the product.");
        setSaving(false);
        return;
      }
      setProducts((prev) => {
        if (form.id) {
          return prev.map((p) => (p.id === form.id ? data.product : p));
        }
        return [...prev, data.product];
      });
      setForm(null);
    } catch {
      setError("Could not save the product. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-white/50">{products.length} in catalog</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openNew} className="btn-acid flex items-center gap-2 text-sm">
            <Plus size={15} /> Add product
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-xl border border-line bg-ink p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-void">
              {p.image ? (
                <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.name}</p>
              <p className="text-xs text-white/50">
                {p.category} · {formatINR(p.price)}{" "}
                <span className="text-white/30 line-through">{formatINR(p.mrp)}</span>
                {!p.active && <span className="ml-2 text-amber-400">Hidden</span>}
              </p>
            </div>
            <button
              onClick={() => openEdit(p)}
              className="rounded-lg border border-line p-2 text-white/60 hover:text-white"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => remove(p.id)}
              disabled={deletingId === p.id}
              className="rounded-lg border border-line p-2 text-red-400/80 hover:text-red-400"
            >
              {deletingId === p.id ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-white/50">
            No products yet — add your first one.
          </p>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-ink p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                {form.id ? "Edit product" : "New product"}
              </h2>
              <button onClick={closeForm} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Meesho Auto-Fill */}
            {!form.id && (
              <div className="mb-4 rounded-xl border border-acid/20 bg-acid/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-acid mb-2">⚡ Auto-fill from Meesho</p>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Paste Meesho product URL..."
                    value={meeshoUrl}
                    onChange={(e) => setMeeshoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && scrapeFromMeesho(meeshoUrl)}
                  />
                  <button
                    type="button"
                    onClick={() => scrapeFromMeesho(meeshoUrl)}
                    disabled={saving || !meeshoUrl}
                    className="rounded-lg bg-acid px-3 py-2 text-xs font-bold text-void disabled:opacity-40 flex items-center gap-1"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : "Fill →"}
                  </button>
                </div>
                <p className="text-[10px] text-white/30 mt-2">Automatically fills name, images, price (2×), sizes from Meesho</p>
              </div>
            )}

                        <div className="space-y-3">
              <Field label="Name">
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            name: e.target.value,
                            slug: f.id ? f.slug : slugify(e.target.value),
                          }
                        : f
                    )
                  }
                />
              </Field>

              <Field label="URL slug">
                <input
                  className="input"
                  value={form.slug}
                  onChange={(e) => setForm((f) => (f ? { ...f, slug: e.target.value } : f))}
                />
              </Field>

              <Field label="Tagline">
                <input
                  className="input"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => (f ? { ...f, tagline: e.target.value } : f))}
                />
              </Field>

              <Field label="Category">
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm((f) => (f ? { ...f, category: e.target.value } : f))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (₹)">
                  <input
                    className="input"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(e) => setForm((f) => (f ? { ...f, price: e.target.value } : f))}
                  />
                </Field>
                <Field label="MRP (₹)">
                  <input
                    className="input"
                    inputMode="numeric"
                    value={form.mrp}
                    onChange={(e) => setForm((f) => (f ? { ...f, mrp: e.target.value } : f))}
                  />
                </Field>
              </div>

              <Field label="Product ID (SKU, optional — for your own tracking, never shown to customers)">
                <input
                  className="input"
                  placeholder="e.g. TEE-001"
                  value={form.productId}
                  onChange={(e) => setForm((f) => (f ? { ...f, productId: e.target.value } : f))}
                />
              </Field>

              <Field label="Photos">
                <div className="flex flex-wrap gap-2">
                  {form.images.map((url) => (
                    <div
                      key={url}
                      className={`group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-void ${
                        form.image === url ? "border-acid" : "border-transparent"
                      }`}
                    >
                      <Image src={url} alt="" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => setCoverImage(url)}
                        title="Set as cover photo"
                        className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
                      >
                        {form.image !== url && <span className="text-[10px] font-medium text-white">Set cover</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(url)}
                        className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5 text-white/80 hover:text-red-400"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-white/50 hover:text-white">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span className="text-[10px]">{uploading ? "…" : "Add"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                  </label>
                </div>
                <p className="mt-1 text-[10px] text-white/30">
                  First photo (or the one marked) is the cover shown in listings. The rest appear as a gallery on the product page.
                </p>
                <input
                  className="input mt-2"
                  placeholder="or paste an image URL and press Enter"
                  value={pasteUrl}
                  onChange={(e) => setPasteUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const url = pasteUrl.trim();
                    if (!url) return;
                    setForm((f) => (f ? { ...f, images: [...f.images, url], image: f.image || url } : f));
                    setPasteUrl("");
                  }}
                />
              </Field>

              <Field label="Product video (optional)">
                <div className="flex items-center gap-3">
                  {form.video && (
                    <video src={form.video} className="h-14 w-14 rounded-lg object-cover" muted />
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-white/70 hover:text-white">
                    {uploadingVideo ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploadingVideo ? "Uploading…" : "Upload video"}
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  </label>
                  {form.video && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => (f ? { ...f, video: "" } : f))}
                      className="text-xs text-white/40 hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  className="input mt-2"
                  placeholder="or paste a video URL"
                  value={form.video}
                  onChange={(e) => setForm((f) => (f ? { ...f, video: e.target.value } : f))}
                />
              </Field>

              <Field label="Sizes (comma separated)">
                <input
                  className="input"
                  value={form.sizes}
                  onChange={(e) => setForm((f) => (f ? { ...f, sizes: e.target.value } : f))}
                />
              </Field>

              <Field label="Description">
                <textarea
                  className="input min-h-[80px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, description: e.target.value } : f))
                  }
                />
              </Field>

              <Field label="Highlights (one per line)">
                <textarea
                  className="input min-h-[70px]"
                  value={form.highlights}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, highlights: e.target.value } : f))
                  }
                />
              </Field>

              <Field label="Fabric / material">
                <input
                  className="input"
                  value={form.fabric}
                  onChange={(e) => setForm((f) => (f ? { ...f, fabric: e.target.value } : f))}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Rating">
                  <input
                    className="input"
                    value={form.rating}
                    onChange={(e) => setForm((f) => (f ? { ...f, rating: e.target.value } : f))}
                  />
                </Field>
                <Field label="Review count">
                  <input
                    className="input"
                    value={form.reviews}
                    onChange={(e) => setForm((f) => (f ? { ...f, reviews: e.target.value } : f))}
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => (f ? { ...f, active: e.target.checked } : f))}
                />
                Visible on the storefront
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={save}
                  disabled={saving || !form.name || !form.price || !form.mrp}
                  className="btn-acid flex flex-1 items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  Save
                </button>
                <button
                  onClick={closeForm}
                  className="rounded-lg border border-line px-4 py-2 text-sm text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--line, #2a2a35);
          background: var(--void, #06060b);
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
        .input:focus {
          border-color: #c8ff00;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-white/50">{label}</label>
      {children}
    </div>
  );
}
