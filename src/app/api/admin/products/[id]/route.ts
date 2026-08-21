import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";
import { updateProduct, deleteProduct } from "@/db/products-repo";
import { normalizeProductInput } from "@/lib/product-input";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
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
    const product = await updateProduct(id, input);
    if (!product) {
      return NextResponse.json({ ok: false, message: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, product });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "";
    const friendly =
      message.includes("unique") || message.includes("duplicate")
        ? "That slug is already used by another product."
        : "Could not update the product.";
    return NextResponse.json({ ok: false, message: friendly }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
