import type { Metadata } from "next";
import { SupportPage } from "@/components/dashboard/pages/DashboardPages";

export const metadata: Metadata = { title: "Support | QUANTIX" };

export default function Page() {
  return <SupportPage />;
}
