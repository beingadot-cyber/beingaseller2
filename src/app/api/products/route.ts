import { NextResponse } from "next/server";
import { listActiveProducts } from "@/db/products-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await listActiveProducts();
    return NextResponse.json({ ok: true, products });
  } catch (err) {
    console.error("[api/products] failed:", err);
    return NextResponse.json({ ok: false, products: [] }, { status: 500 });
  }
}
