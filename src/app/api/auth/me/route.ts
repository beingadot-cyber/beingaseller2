import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const id = jar.get("bs_customer")?.value;
  if (!id) return NextResponse.json({ ok: false, customer: null });

  await ensureSchema();
  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  if (!customer) return NextResponse.json({ ok: false, customer: null });

  return NextResponse.json({ ok: true, customer: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone } });
}
