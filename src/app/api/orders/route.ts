import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getProduct, shippingFor } from "@/data/products";

export const runtime = "nodejs";

type CartItemInput = { slug: string; size: string; qty: number };
type CustomerInput = {
  name: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
};

function bad(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

export async function POST(req: Request) {
  let body: { customer?: CustomerInput; items?: CartItemInput[] };
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request body.");
  }

  const { customer, items } = body;

  /* ── Validate customer ─────────────────────────── */
  if (!customer) return bad("Customer details are missing.");

  const name = (customer.name ?? "").trim();
  const phone = (customer.phone ?? "").trim();
  const email = (customer.email ?? "").trim();
  const addressLine1 = (customer.addressLine1 ?? "").trim();
  const addressLine2 = (customer.addressLine2 ?? "").trim();
  const landmark = (customer.landmark ?? "").trim();
  const city = (customer.city ?? "").trim();
  const state = (customer.state ?? "").trim();
  const pincode = (customer.pincode ?? "").trim();

  if (name.length < 3) return bad("Please enter your full name.");
  if (!/^[6-9]\d{9}$/.test(phone))
    return bad("Enter a valid 10-digit Indian mobile number.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return bad("That email address does not look right.");
  if (addressLine1.length < 5) return bad("Please enter your full address.");
  if (city.length < 2) return bad("Please enter your city.");
  if (!state) return bad("Please select your state.");
  if (!/^\d{6}$/.test(pincode)) return bad("Enter a valid 6-digit pincode.");

  /* ── Validate items & recompute prices server-side ── */
  if (!Array.isArray(items) || items.length === 0)
    return bad("Your bag is empty.");

  const lineItems: {
    slug: string;
    name: string;
    size: string;
    qty: number;
    price: number;
    image: string;
  }[] = [];

  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) return bad(`Unknown product: ${item.slug}`);
    if (!product.sizes.includes(item.size))
      return bad(`Invalid size "${item.size}" for ${product.name}.`);
    const qty = Math.floor(Number(item.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 10)
      return bad(`Invalid quantity for ${product.name}.`);
    lineItems.push({
      slug: product.slug,
      name: product.name,
      size: item.size,
      qty,
      price: product.price,
      image: product.image,
    });
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  try {
    const [order] = await db
      .insert(orders)
      .values({
        customerName: name,
        phone,
        email: email || null,
        addressLine1,
        addressLine2: addressLine2 || null,
        landmark: landmark || null,
        city,
        state,
        pincode,
        items: lineItems,
        subtotal,
        shipping,
        total,
        status: "PENDING",
        paymentProvider: "PHONEPE",
      })
      .returning({ id: orders.id });

    return NextResponse.json({ ok: true, orderId: order.id, total });
  } catch (err) {
    console.error("[orders] insert failed:", err);
    return NextResponse.json(
      { ok: false, message: "Could not create the order. Please try again." },
      { status: 500 }
    );
  }
}
