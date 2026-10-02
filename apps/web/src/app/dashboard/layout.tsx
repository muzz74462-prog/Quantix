import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Trading Dashboard | QUANTIX",
  description: "QUANTIX demo trading terminal. Simulated data and virtual funds only.",
  robots: { index: false, follow: false },
};

/** The shell lives in the layout so trades, balances and chart state survive page changes. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
