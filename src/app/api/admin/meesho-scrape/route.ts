import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";

export const runtime = "nodejs";

function extractMeta(html: string, property: string): string {
  const m = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, "i"));
  return m ? m[1].trim() : "";
}

function extractJsonLd(html: string): Record<string, unknown> {
  const matches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1]);
      if (data["@type"] === "Product" || data.name) return data;
    } catch { /* skip */ }
  }
  return {};
}

function extractNextData(html: string): Record<string, unknown> {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return {};
  try { return JSON.parse(m[1]); } catch { return {}; }
}

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function getSizes(data: Record<string, unknown>): string[] {
  // Try JSON-LD offers
  const offers = (data.offers as Record<string, unknown>[]) ?? [];
  const sizes: string[] = [];
  for (const o of offers) {
    const variant = (o.name ?? o.itemOffered) as string | undefined;
    if (variant && /^(XS|S|M|L|XL|XXL|XXXL|\d+)$/i.test(String(variant).trim())) {
      sizes.push(String(variant).trim().toUpperCase());
    }
  }
  if (sizes.length) return [...new Set(sizes)];
  return ["S", "M", "L", "XL", "XXL"];
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { url } = await req.json().catch(() => ({}));
  if (!url || !url.includes("meesho.com")) {
    return NextResponse.json({ ok: false, message: "Please enter a valid Meesho product URL." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Try JSON-LD first
    const jsonLd = extractJsonLd(html);
    const nextData = extractNextData(html);

    // Extract product data from multiple sources
    let name = (jsonLd.name as string) ?? extractMeta(html, "og:title") ?? "";
    let image = (jsonLd.image as string) ?? extractMeta(html, "og:image") ?? "";
    let description = (jsonLd.description as string) ?? extractMeta(html, "og:description") ?? "";
    let price = 0;
    let mrp = 0;
    let fabric = "";
    let sizes: string[] = [];

    // Try Next.js page data
    const pageProps = (nextData as Record<string, unknown>)?.props as Record<string, unknown>;
    const catalogObj = pageProps?.pageProps as Record<string, unknown>;

    // Meesho often stores product in __NEXT_DATA__ under various keys
    const productData = catalogObj?.product as Record<string, unknown>
      ?? catalogObj?.catalogData as Record<string, unknown>
      ?? {};

    if (productData) {
      name = name || (productData.displayName as string) || (productData.name as string) || "";
      const variants = (productData.variants as Record<string, unknown>[]) ?? [];
      if (variants.length) {
        const firstVariant = variants[0];
        price = Number(firstVariant.mrp ?? firstVariant.price ?? 0);
        mrp = price;
        const imgs = (firstVariant.images as string[]) ?? [];
        if (imgs.length && !image) image = imgs[0];
        // Extract sizes from variants
        sizes = variants
          .map((v) => String(v.size ?? "").trim().toUpperCase())
          .filter((s) => s && /^(XS|S|M|L|XL|XXL|XXXL|\d+)$/.test(s));
      }
      fabric = (productData.material as string) ?? "";
    }

    // Fallback: parse price from JSON-LD
    if (!price) {
      const offers = jsonLd.offers as Record<string, unknown> | undefined;
      if (offers?.price) price = Math.round(Number(offers.price));
      else if (offers?.lowPrice) price = Math.round(Number(offers.lowPrice));
      mrp = mrp || price;
    }

    // Clean image URL
    if (image.includes("meesho.com") || image.includes("ik.imagekit")) {
      image = image.split("?")[0];
    }

    // Clean name — remove brand clutter
    name = name.replace(/\s*[-|].*meesho.*/i, "").trim();

    if (!name) {
      return NextResponse.json({ ok: false, message: "Could not extract product details. Try again or fill manually." }, { status: 422 });
    }

    const sellingPrice = Math.round(price * 2); // 2x Meesho price rule
    const finalMrp = Math.round(mrp || price);

    return NextResponse.json({
      ok: true,
      product: {
        name,
        slug: slugify(name),
        tagline: description.slice(0, 120),
        description,
        image,
        price: sellingPrice,
        mrp: finalMrp,
        sourcingPrice: finalMrp,
        sourcingRef: url,
        meeshoUrl: url,
        sizes: sizes.length ? sizes : ["S", "M", "L", "XL", "XXL"],
        fabric: fabric || "Cotton Blend",
        category: "Tees",
        rating: 4.6,
        reviews: Math.floor(Math.random() * 500) + 100,
      },
    });
  } catch (err) {
    console.error("[meesho-scrape]", err);
    return NextResponse.json({
      ok: false,
      message: "Could not fetch product. Meesho may have blocked the request — try again or fill details manually.",
    }, { status: 502 });
  }
}
