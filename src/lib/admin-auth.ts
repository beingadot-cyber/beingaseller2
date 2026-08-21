import "server-only";
import crypto from "node:crypto";

const COOKIE_NAME = "admin_session";

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

/** Deterministic session token derived from the current admin password. */
function expectedToken(): string {
  return crypto
    .createHash("sha256")
    .update("beingaseller-admin::" + adminPassword())
    .digest("hex");
}

export function adminConfigured(): boolean {
  return Boolean(adminPassword());
}

export function checkPassword(candidate: string): boolean {
  if (!adminConfigured()) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(adminPassword());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function sessionCookieName(): string {
  return COOKIE_NAME;
}

export function sessionCookieValue(): string {
  return expectedToken();
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue || !adminConfigured()) return false;
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(expectedToken());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
