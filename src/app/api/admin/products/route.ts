import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";
import { listAllProducts, createProduct } from "@/db/products-repo";
import { normalizeProductInput } from "@/lib/product-input";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  const products = await listAllProducts();
  return NextResponse.json({ ok: true, products });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }
  const { input, error } = normalizeProductInput(body);
  if (error || !input) {
    return NextResponse.json({ ok: false, message: error }, { status: 400 });
  }
  try {
    const product = await createProduct(input);
    return NextResponse.json({ ok: true, product });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "";
    const friendly =
      message.includes("unique") || message.includes("duplicate")
        ? "That slug is already used by another product."
        : "Could not create the product.";
    return NextResponse.json({ ok: false, message: friendly }, { status: 500 });
  }
}
