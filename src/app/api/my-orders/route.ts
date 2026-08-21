import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { orders, customers } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(req: Request) {
  await ensureSchema();
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone") ?? "";
  const email = url.searchParams.get("email") ?? "";

  // Try cookie session first
  const jar = await cookies();
  const customerId = jar.get("bs_customer")?.value;
  let customerEmail = email;

  if (customerId) {
    const [c] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (c) customerEmail = c.email;
  }

  if (!customerEmail && !phone) {
    return NextResponse.json({ ok: false, message: "Please log in to view orders." }, { status: 401 });
  }

  const conditions = [];
  if (customerEmail) conditions.push(eq(orders.email, customerEmail));
  if (phone) conditions.push(eq(orders.phone, phone));

  const rows = await db
    .select()
    .from(orders)
    .where(conditions.length > 1 ? or(...conditions) : conditions[0])
    .orderBy(orders.createdAt);

  const result = rows.map((o) => ({
    id: o.id,
    shortId: o.id.slice(0, 8).toUpperCase(),
    status: o.status,
    total: o.total,
    items: o.items,
    city: o.city,
    state: o.state,
    createdAt: o.createdAt,
    demo: o.demo,
  }));

  return NextResponse.json({ ok: true, orders: result });
}
