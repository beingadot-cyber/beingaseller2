import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Creates the tables this app needs if they don't already exist.
 *
 * This project has no terminal access in its normal workflow (files are
 * uploaded via the GitHub web UI), so instead of relying on
 * `drizzle-kit push` being run locally, every DB-touching request makes
 * sure the schema is in place first. CREATE TABLE IF NOT EXISTS is cheap
 * and safe to run repeatedly.
 */
let ready: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = run().catch((err) => {
      // Allow a later request to retry if this attempt failed.
      ready = null;
      throw err;
    });
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
      rating double precision NOT NULL DEFAULT 4.5,
      reviews integer NOT NULL DEFAULT 0,
      image text NOT NULL DEFAULT '',
      accent varchar(20) NOT NULL DEFAULT '#c8ff00',
      sizes jsonb NOT NULL DEFAULT '[]',
      description text NOT NULL DEFAULT '',
      highlights jsonb NOT NULL DEFAULT '[]',
      fabric text NOT NULL DEFAULT '',
      dispatch text NOT NULL DEFAULT 'Ships in 24–48 hrs',
      active boolean NOT NULL DEFAULT true,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}
