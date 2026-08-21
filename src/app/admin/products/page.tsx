import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSession, sessionCookieName } from "@/lib/admin-auth";
import { listAllProducts } from "@/db/products-repo";
import { AdminDashboard } from "./dashboard";

export default async function AdminProductsPage() {
  const store = await cookies();
  const value = store.get(sessionCookieName())?.value;
  if (!isValidSession(value)) {
    redirect("/admin");
  }

  const products = await listAllProducts();

  return <AdminDashboard initialProducts={products} />;
}
