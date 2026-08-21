import "server-only";
import { cookies } from "next/headers";
import { isValidSession, sessionCookieName } from "@/lib/admin-auth";

/** Returns true if the current request has a valid admin session cookie. */
export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(sessionCookieName())?.value;
  return isValidSession(value);
}
