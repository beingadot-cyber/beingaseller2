import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdminRequest } from "@/lib/require-admin";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  // Newer Vercel Blob stores authorize connected projects via OIDC instead
  // of a BLOB_READ_WRITE_TOKEN env var, so we don't gate on that var being
  // present — we just attempt the upload and report a clear error if the
  // store genuinely isn't connected yet.
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Image uploads aren't set up yet. In Vercel, go to Storage → Create Database → Blob, connect it to this project, then redeploy.",
      },
      { status: 503 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "No file received." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "Please upload an image file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, message: "Image must be under 4MB." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;

  try {
    const blob = await put(safeName, file, { access: "public" });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error("[admin upload] failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, message: `Upload failed: ${detail}` },
      { status: 500 }
    );
  }
}
