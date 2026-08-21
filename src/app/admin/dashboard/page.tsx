import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSession, sessionCookieName } from "@/lib/admin-auth";
import { getSalesAnalytics } from "@/db/analytics-repo";
import { AdminNav } from "../admin-nav";
import { SalesDashboard } from "./sales-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const store = await cookies();
  const value = store.get(sessionCookieName())?.value;
  if (!isValidSession(value)) {
    redirect("/admin");
  }

  const analytics = await getSalesAnalytics();

  return (
    <>
      <AdminNav />
      <SalesDashboard analytics={analytics} />
    </>
  );
}
