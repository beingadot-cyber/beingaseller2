import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { otpTokens, customers } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, otp } = await req.json().catch(() => ({}));
  if (!email || !otp) {
    return NextResponse.json({ ok: false, message: "Email and OTP required." }, { status: 400 });
  }

  await ensureSchema();
  const now = new Date();

  const [token] = await db
    .select()
    .from(otpTokens)
    .where(
      and(
        eq(otpTokens.email, email.toLowerCase()),
        eq(otpTokens.otp, String(otp)),
        eq(otpTokens.used, false),
        gt(otpTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!token) {
    return NextResponse.json({ ok: false, message: "Invalid or expired OTP." }, { status: 401 });
  }

  // Mark used
  await db.update(otpTokens).set({ used: true }).where(eq(otpTokens.id, token.id));

  // Upsert customer
  const existing = await db.select().from(customers).where(eq(customers.email, email.toLowerCase())).limit(1);
  let customerId: string;
  if (existing.length > 0) {
    await db.update(customers).set({ lastLoginAt: now }).where(eq(customers.id, existing[0].id));
    customerId = existing[0].id;
  } else {
    const [newCustomer] = await db.insert(customers).values({ email: email.toLowerCase(), lastLoginAt: now }).returning({ id: customers.id });
    customerId = newCustomer.id;
  }

  // Set session cookie (30 days)
  const jar = await cookies();
  jar.set("bs_customer", customerId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, customerId });
}
