import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSession, sessionCookieName } from "@/lib/admin-auth";
import { listOrders } from "@/db/orders-repo";
import { AdminNav } from "../admin-nav";
import { OrdersDashboard } from "./orders-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const store = await cookies();
  const value = store.get(sessionCookieName())?.value;
  if (!isValidSession(value)) {
    redirect("/admin");
  }

  const orders = await listOrders();

  return (
    <>
      <AdminNav />
      <OrdersDashboard initialOrders={orders} />
    </>
  );
}
