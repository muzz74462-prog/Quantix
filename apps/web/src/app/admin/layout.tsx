import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getAdmin } from "@/lib/adminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin | QUANTIX",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdmin();
  // Not signed in: render the page bare (the login page). Every page re-checks the session itself.
  if (!admin) return <main className="min-h-screen bg-ink-950 px-4 text-slate-100">{children}</main>;
  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 lg:flex">
      <AdminSidebar email={admin.email} role={admin.role} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
