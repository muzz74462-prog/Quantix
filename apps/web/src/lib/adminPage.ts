import { redirect } from "next/navigation";
import { getAdmin, type AdminIdentity } from "@/lib/adminAuth";

/** Use at the top of every admin page: no valid DB-backed admin session -> back to the login page. */
export async function requirePageAdmin(): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
