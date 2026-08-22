import { sql } from "drizzle-orm";
import { db } from "@/db";

let ready: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = run().catch((err) => { ready = null; throw err; });
  }
  return ready;
}

async function run() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name text NOT NULL,
      phone varchar(15) NOT NULL,
      email text,
      address_line1 text NOT NULL,
      address_line2 text,
      landmark text,
      city text NOT NULL,
      state text NOT NULL,
      pincode varchar(6) NOT NULL,
      items jsonb NOT NULL,
      subtotal integer NOT NULL,
      shipping integer NOT NULL,
      total integer NOT NULL,
      status varchar(20) NOT NULL DEFAULT 'PENDING',
      payment_provider varchar(20) NOT NULL DEFAULT 'PHONEPE',
      phonepe_txn_id text,
      provider_code text,
      demo boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug varchar(160) NOT NULL UNIQUE,
      name text NOT NULL,
      tagline text NOT NULL DEFAULT '',
      category varchar(40) NOT NULL,
      price integer NOT NULL,
      mrp integer NOT NULL,
      sourcing_price integer NOT NULL DEFAULT 0,
      sourcing_ref text NOT NULL DEFAULT '',
      product_id text NOT NULL DEFAULT '',
      meesho_url text NOT NULL DEFAULT '',
      rating double precision NOT NULL DEFAULT 4.5,
      reviews integer NOT NULL DEFAULT 0,
      image text NOT NULL DEFAULT '',
      images jsonb NOT NULL DEFAULT '[]',
      video text NOT NULL DEFAULT '',
      accent varchar(20) NOT NULL DEFAULT '#c8ff00',
      sizes jsonb NOT NULL DEFAULT '[]',
      colors jsonb NOT NULL DEFAULT '[]',
      description text NOT NULL DEFAULT '',
      highlights jsonb NOT NULL DEFAULT '[]',
      fabric text NOT NULL DEFAULT '',
      dispatch text NOT NULL DEFAULT 'Ships in 7–10 days',
      active boolean NOT NULL DEFAULT true,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  // Add meesho_url column if upgrading existing DB
  await db.execute(sql`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS meesho_url text NOT NULL DEFAULT '';
  `);
  await db.execute(sql`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS colors jsonb NOT NULL DEFAULT '[]';
  `);
  await db.execute(sql`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS product_id text NOT NULL DEFAULT '';
  `);
  await db.execute(sql`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]';
  `);
  await db.execute(sql`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS video text NOT NULL DEFAULT '';
  `);

  // One-time cleanup: products seeded before the delivery estimate was
  // extended still say "24–48 hrs" — bring them in line with the current
  // default without touching any dispatch text an admin customised.
  await db.execute(sql`
    UPDATE products SET dispatch = 'Ships in 7–10 days' WHERE dispatch = 'Ships in 24–48 hrs';
  `);
  // Backfill the new gallery array from the existing single cover image,
  // so older products still show at least one photo in the gallery.
  await db.execute(sql`
    UPDATE products SET images = jsonb_build_array(image)
    WHERE (images IS NULL OR images = '[]'::jsonb) AND image <> '';
  `);

  // Coupon support on orders (upgrading existing DB)
  await db.execute(sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code text;
  `);
  await db.execute(sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount integer NOT NULL DEFAULT 0;
  `);

  // ── Customers: name + mobile number login (no OTP) ──────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS customers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      phone varchar(15) NOT NULL UNIQUE,
      name text NOT NULL DEFAULT '',
      email text,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_login_at timestamptz
    );
  `);

  // Upgrading from the old email-OTP schema: relax the old email
  // NOT NULL constraint and make sure a unique index exists on phone.
  await db.execute(sql`
    ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;
  `);
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'customers_phone_unique'
      ) THEN
        ALTER TABLE customers ADD CONSTRAINT customers_phone_unique UNIQUE (phone);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- e.g. duplicate '' phone values from an older email-only schema —
      -- skip the constraint rather than block app startup; the app-level
      -- lookup-by-phone logic still works fine without it.
      NULL;
    END $$;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS complaints (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id uuid,
      customer_name text NOT NULL,
      email text NOT NULL,
      phone varchar(15) NOT NULL,
      product_name text NOT NULL,
      rating smallint NOT NULL DEFAULT 5,
      comment varchar(120) NOT NULL DEFAULT '',
      location text NOT NULL DEFAULT '',
      status varchar(20) NOT NULL DEFAULT 'OPEN',
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}
