import type { Metadata } from "next";
import { isAdmin } from "@/lib/adminAuth";
import { getAdminStats, type AdminStats } from "@/lib/adminStats";
import { AdminLogin, LogoutButton } from "@/components/admin/AdminClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin | QUANTIX",
  robots: { index: false, follow: false },
};

function fmt(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900 p-4">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-extrabold text-white">{value}</div>
    </div>
  );
}

export default async function AdminPage() {
  if (!isAdmin()) {
    return (
      <main className="min-h-screen bg-ink-950 px-4 text-slate-100">
        <AdminLogin />
      </main>
    );
  }

  let stats: AdminStats | null = null;
  let error = "";
  try {
    stats = await getAdminStats();
  } catch (e) {
    console.error("admin stats failed:", e);
    error = "Could not load stats. Check the Netlify function logs.";
  }

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white">QUANTIX Admin</h1>
          <LogoutButton />
        </div>

        {error && <p className="mt-6 rounded-md bg-down/10 p-3 text-[14px] text-down">{error}</p>}

        {stats && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Total accounts" value={stats.total} />
              <Stat label="Today (UTC)" value={stats.today} />
              <Stat label="Last 7 days" value={stats.week} />
            </div>

            <h2 className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-slate-400">Top countries</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.countries.length === 0 && <span className="text-[14px] text-slate-500">No data yet.</span>}
              {stats.countries.map((c) => (
                <span key={c.country} className="rounded-full bg-ink-800 px-3 py-1 text-[13px] text-slate-200">
                  {c.country} · {c.count}
                </span>
              ))}
            </div>

            <h2 className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-slate-400">Latest 50 accounts</h2>
            <div className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-ink-900">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Email</th>
                    <th className="px-4 py-2 font-semibold">Country</th>
                    <th className="px-4 py-2 font-semibold">Currency</th>
                    <th className="px-4 py-2 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.latest.map((u) => (
                    <tr key={u.email + u.created_at} className="border-t border-white/[0.06]">
                      <td className="px-4 py-2 text-white">{u.email}</td>
                      <td className="px-4 py-2">{u.country || "-"}</td>
                      <td className="px-4 py-2">{u.currency}</td>
                      <td className="px-4 py-2 text-slate-400">{fmt(u.created_at)}</td>
                    </tr>
                  ))}
                  {stats.latest.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-slate-500">
                        No accounts yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}