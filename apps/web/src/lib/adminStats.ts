import { db } from "@/lib/supabaseAdmin";
import type { LedgerRow, UserRow } from "@/lib/adminData";

export type AdminStats = {
  usersTotal: number; usersToday: number; usersWeek: number;
  totalBalance: number; credits30d: number; debits30d: number; adjustments30d: number;
  countries: { country: string; count: number }[];
  latestUsers: Pick<UserRow, "id" | "email" | "country" | "currency" | "created_at">[];
  latestAdjustments: LedgerRow[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const [overview, countryRows, latestUsers, latestAdj] = await Promise.all([
    db().rpc("admin_overview"),
    db().from("users").select("country").limit(5000),
    db().from("users").select("id,email,country,currency,created_at").order("created_at", { ascending: false }).limit(8),
    db()
      .from("balance_ledger")
      .select("id,user_id,entry_type,direction,amount,currency,previous_balance,new_balance,reason,note,admin_email,created_at,users!inner(email)")
      .in("entry_type", ["admin_credit", "admin_debit"])
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  for (const r of [overview, countryRows, latestUsers, latestAdj]) if (r.error) throw r.error;

  const o = (overview.data ?? {}) as Record<string, number>;
  const counts = new Map<string, number>();
  for (const r of (countryRows.data ?? []) as { country: string | null }[]) {
    const c = r.country?.trim() || "Unknown";
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return {
    usersTotal: Number(o.users_total ?? 0),
    usersToday: Number(o.users_today ?? 0),
    usersWeek: Number(o.users_week ?? 0),
    totalBalance: Number(o.total_balance ?? 0),
    credits30d: Number(o.credits_30d ?? 0),
    debits30d: Number(o.debits_30d ?? 0),
    adjustments30d: Number(o.adjustments_30d ?? 0),
    countries: [...counts.entries()].map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 5),
    latestUsers: (latestUsers.data ?? []) as AdminStats["latestUsers"],
    latestAdjustments: (latestAdj.data ?? []) as unknown as LedgerRow[],
  };
}
