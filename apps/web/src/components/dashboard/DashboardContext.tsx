"use client";

import { createContext, useContext } from "react";
import type { DemoUser } from "@/lib/session";

export type DashboardContextValue = {
  user: DemoUser | null;
  demoBalance: number;
  liveBalance: number;
  /** Deducts from the real account. Returns false (and changes nothing) if the balance is too low. */
  chargeLive: (amount: number) => boolean;
  logout: () => void;
};

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside the dashboard layout");
  return ctx;
}
