import type { Metadata } from "next";
import { TournamentsPage } from "@/components/dashboard/pages/DashboardPages";

export const metadata: Metadata = { title: "Tournaments | QUANTIX" };

export default function Page() {
  return <TournamentsPage />;
}
