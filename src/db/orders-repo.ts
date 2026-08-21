import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, complaints, type Order, type Complaint } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";

export async function listOrders(): Promise<Order[]> {
  await ensureSchema();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

const ORDER_STATUSES = ["PENDING", "PAID", "FAILED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
  await ensureSchema();
  const [row] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return row;
}

export async function listComplaints(): Promise<Complaint[]> {
  await ensureSchema();
  return db.select().from(complaints).orderBy(desc(complaints.createdAt));
}

const COMPLAINT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export function isComplaintStatus(value: string): value is ComplaintStatus {
  return (COMPLAINT_STATUSES as readonly string[]).includes(value);
}

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus
): Promise<Complaint | undefined> {
  await ensureSchema();
  const [row] = await db
    .update(complaints)
    .set({ status })
    .where(eq(complaints.id, id))
    .returning();
  return row;
}
