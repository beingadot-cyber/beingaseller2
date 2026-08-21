import type { Order } from "@/db/schema";
import { logOrder } from "@/lib/sheets";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

/**
 * Fires the side effects that should happen exactly once, the moment an
 * order transitions into PAID: log it to the "Orders" Google Sheet tab and
 * (if an email was given) send a confirmation email. Never throws — logging
 * failures must never break the checkout flow for the customer.
 */
export async function onOrderPaid(order: Order): Promise<void> {
  const items =
    (order.items as { name: string; size: string; qty: number; price: number }[]) ?? [];

  logOrder({
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email ?? "",
    addressLine1: order.addressLine1,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    items,
    total: order.total,
    status: "PAID",
    createdAt: order.createdAt,
  }).catch(console.error);

  if (order.email) {
    sendOrderConfirmationEmail(order.email, order.customerName, order.id, items, order.total).catch(
      console.error
    );
  }
}
