import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, customers } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(req: Request) {
  await ensureSchema();
  const url = new URL(req.url);
  const queryPhone = url.searchParams.get("phone") ?? "";

  // Try cookie session first — a logged-in customer's own phone number
  // always wins over whatever was typed into the guest-tracking box.
  const jar = await cookies();
  const customerId = jar.get("bs_customer")?.value;
  let phone = queryPhone;

  if (customerId) {
    const [c] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (c) phone = c.phone;
  }

  if (!phone) {
    return NextResponse.json({ ok: false, message: "Please log in to view orders." }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.phone, phone))
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
