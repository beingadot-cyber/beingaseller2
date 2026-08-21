import {
  pgTable, uuid, text, varchar, integer, jsonb,
  boolean, timestamp, doublePrecision, smallint,
} from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  email: text("email"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  landmark: text("landmark"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: varchar("pincode", { length: 6 }).notNull(),
  items: jsonb("items").notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  paymentProvider: varchar("payment_provider", { length: 20 }).notNull().default("PHONEPE"),
  phonepeTxnId: text("phonepe_txn_id"),
  providerCode: text("provider_code"),
  demo: boolean("demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

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
  meeshoUrl: text("meesho_url").notNull().default(""),
  rating: doublePrecision("rating").notNull().default(4.5),
  reviews: integer("reviews").notNull().default(0),
  image: text("image").notNull().default(""),
  accent: varchar("accent", { length: 20 }).notNull().default("#c8ff00"),
  sizes: jsonb("sizes").notNull().default([]),
  colors: jsonb("colors").notNull().default([]),
  description: text("description").notNull().default(""),
  highlights: jsonb("highlights").notNull().default([]),
  fabric: text("fabric").notNull().default(""),
  dispatch: text("dispatch").notNull().default("Ships in 24–48 hrs"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;

// ── Customer accounts (email + OTP login) ──────────────────────────────
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  phone: varchar("phone", { length: 15 }).notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export type Customer = typeof customers.$inferSelect;

// ── OTP tokens ──────────────────────────────────────────────────────────
export const otpTokens = pgTable("otp_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Customer support / complaints ───────────────────────────────────────
export const complaints = pgTable("complaints", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id"),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  productName: text("product_name").notNull(),
  rating: smallint("rating").notNull().default(5),
  comment: varchar("comment", { length: 120 }).notNull().default(""),
  location: text("location").notNull().default(""),
  status: varchar("status", { length: 20 }).notNull().default("OPEN"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Complaint = typeof complaints.$inferSelect;
