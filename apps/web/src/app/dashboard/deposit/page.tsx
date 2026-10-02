import type { Metadata } from "next";
import { FundsPage } from "@/components/dashboard/pages/DashboardPages";

export const metadata: Metadata = { title: "Deposit | QUANTIX" };

export default function Page() {
  return <FundsPage initialTab="deposit" />;
}
