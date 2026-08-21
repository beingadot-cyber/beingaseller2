import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSession, sessionCookieName, adminConfigured } from "@/lib/admin-auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminPage() {
  const store = await cookies();
  const value = store.get(sessionCookieName())?.value;
  if (isValidSession(value)) {
    redirect("/admin/products");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-ink p-8">
        <h1 className="mb-1 font-display text-xl font-bold">Admin login</h1>
        <p className="mb-6 text-sm text-white/60">
          Manage your product catalog.
        </p>
        {!adminConfigured() ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
            Admin login isn&apos;t set up yet. Add an <code>ADMIN_PASSWORD</code>{" "}
            environment variable in Vercel (Settings → Environment Variables),
            then redeploy.
          </p>
        ) : (
          <AdminLoginForm />
        )}
      </div>
    </div>
  );
}
