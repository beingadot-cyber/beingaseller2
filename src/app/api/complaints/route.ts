import { NextResponse } from "next/server";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";
import { logComplaint } from "@/lib/sheets";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const customerName = (body.customerName ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const productName = (body.productName ?? "").trim();
  const rating = Number(body.rating ?? 5);
  const comment = (body.comment ?? "").trim().slice(0, 120);
  const location = (body.location ?? "").trim();
  const orderId = body.orderId ?? null;

  if (!customerName || !email || !phone || !productName || !comment) {
    return NextResponse.json({ ok: false, message: "All fields are required." }, { status: 400 });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ ok: false, message: "Valid 10-digit mobile number required." }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, message: "Rating must be 1–5." }, { status: 400 });
  }

  await ensureSchema();

  const [row] = await db
    .insert(complaints)
    .values({ customerName, email, phone, productName, rating, comment, location, orderId })
    .returning();

  // Log to Google Sheets async (don't block response)
  logComplaint({ ...row, id: row.id, createdAt: row.createdAt }).catch(console.error);

  return NextResponse.json({ ok: true, id: row.id });
}
