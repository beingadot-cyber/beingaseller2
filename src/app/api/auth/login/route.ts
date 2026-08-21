import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";
import { cookies } from "next/headers";

export const runtime = "nodejs";

/**
 * POST /api/auth/login  { name, phone }
 *
 * No OTP — this is intentional per the site owner's request. The customer
 * enters their name and mobile number and is logged straight in. If a
 * customer with that phone number already exists, we sign them back into
 * that same account (so their past orders are still there); otherwise a
 * new account is created.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (name.length < 2) {
    return NextResponse.json({ ok: false, message: "Please enter your name." }, { status: 400 });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { ok: false, message: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }

  await ensureSchema();
  const now = new Date();

  const existing = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);

  let customerId: string;
  if (existing.length > 0) {
    await db
      .update(customers)
      .set({ name, lastLoginAt: now })
      .where(eq(customers.id, existing[0].id));
    customerId = existing[0].id;
  } else {
    const [created] = await db
      .insert(customers)
      .values({ phone, name, lastLoginAt: now })
      .returning({ id: customers.id });
    customerId = created.id;
  }

  const jar = await cookies();
  jar.set("bs_customer", customerId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return NextResponse.json({ ok: true, customer: { id: customerId, name, phone } });
}
