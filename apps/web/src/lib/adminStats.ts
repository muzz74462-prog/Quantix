import { createClient } from "@supabase/supabase-js";

export type AdminUserRow = {
  email: string;
  country: string;
  currency: string;
  created_at: string;
};

export type AdminStats = {
  total: number;
  today: number;
  week: number;
  countries: { country: string; count: number }[];
  latest: AdminUserRow[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  const db = createClient(url, key, { auth: { persistSession: false } });

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, today, week, latest, countryRows] = await Promise.all([
    db.from("users").select("*", { count: "exact", head: true }),
    db.from("users").select("*", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
    db.from("users").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    db
      .from("users")
      .select("email,country,currency,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    db.from("users").select("country").limit(5000),
  ]);

  for (const r of [total, today, week, latest, countryRows]) {
    if (r.error) throw r.error;
  }

  const counts = new Map<string, number>();
  for (const r of (countryRows.data ?? []) as { country: string }[]) {
    const c = r.country?.trim() || "Unknown";
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const countries = [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: total.count ?? 0,
    today: today.count ?? 0,
    week: week.count ?? 0,
    countries,
    latest: (latest.data ?? []) as AdminUserRow[],
  };
}