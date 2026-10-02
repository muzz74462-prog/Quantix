import type { Metadata } from "next";
import { AccountPage } from "@/components/dashboard/pages/DashboardPages";

export const metadata: Metadata = { title: "My account | QUANTIX" };

export default function Page() {
  return <AccountPage />;
}
