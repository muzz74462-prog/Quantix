import type { Metadata } from "next";
import { HelpPage } from "@/components/dashboard/pages/DashboardPages";

export const metadata: Metadata = { title: "Help | QUANTIX" };

export default function Page() {
  return <HelpPage />;
}
