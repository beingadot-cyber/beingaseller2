import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  jsonb,
  boolean,
  timestamp,
  doublePrecision,
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

/**
 * Product catalog, editable from /admin.
 * Seeded once from the original static list on first read; from then on
 * this table is the single source of truth for the storefront.
 */
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  category: varchar("category", { length: 40 }).notNull(),
  price: integer("price").notNull(),
  mrp: integer("mrp").notNull(),
  sourcingPrice: integer("sourcing_price").notNull().default(0),
  sourcingRef: text("sourcing_ref").notNull().default(""),
  rating: doublePrecision("rating").notNull().default(4.5),
  reviews: integer("reviews").notNull().default(0),
  image: text("image").notNull().default(""),
  accent: varchar("accent", { length: 20 }).notNull().default("#c8ff00"),
  sizes: jsonb("sizes").notNull().default([]),
  description: text("description").notNull().default(""),
  highlights: jsonb("highlights").notNull().default([]),
  fabric: text("fabric").notNull().default(""),
  dispatch: text("dispatch").notNull().default("Ships in 24–48 hrs"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
