import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSession, sessionCookieName } from "@/lib/admin-auth";
import { listComplaints } from "@/db/orders-repo";
import { AdminNav } from "../admin-nav";
import { ComplaintsDashboard } from "./complaints-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminComplaintsPage() {
  const store = await cookies();
  const value = store.get(sessionCookieName())?.value;
  if (!isValidSession(value)) {
    redirect("/admin");
  }

  const complaints = await listComplaints();

  return (
    <>
      <AdminNav />
      <ComplaintsDashboard initialComplaints={complaints} />
    </>
  );
}
