import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  jsonb,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Orders captured on the Beingaseller storefront.
 * Each row stores the full buyer snapshot (name / phone / address) so the
 * fulfilment automation can replay the exact same order upstream.
 */
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Buyer details
  customerName: text("customer_name").notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  email: text("email"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  landmark: text("landmark"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: varchar("pincode", { length: 6 }).notNull(),

  // Cart snapshot: [{ slug, name, size, qty, price }] — prices in INR
  items: jsonb("items").notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),

  // Payment state machine: PENDING → PAID | FAILED
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  paymentProvider: varchar("payment_provider", { length: 20 })
    .notNull()
    .default("PHONEPE"),
  phonepeTxnId: text("phonepe_txn_id"),
  providerCode: text("provider_code"),
  demo: boolean("demo").notNull().default(false),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
