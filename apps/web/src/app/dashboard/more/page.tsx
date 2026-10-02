import type { Metadata } from "next";
import { MorePage } from "@/components/dashboard/pages/DashboardPages";

export const metadata: Metadata = { title: "More | QUANTIX" };

export default function Page() {
  return <MorePage />;
}
