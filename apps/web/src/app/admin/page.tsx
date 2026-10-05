import Link from "next/link";
import { requirePageAdmin } from "@/lib/adminPage";
import { getAdminStats, type AdminStats } from "@/lib/adminStats";
import { fmtMoney, fmtUtc } from "@/lib/adminFormat";
import { LedgerTable } from "@/components/admin/LedgerTable";
import { ErrorNote, Panel, PageShell, StatCard, TD, TH, TableWrap, EmptyRow } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await requirePageAdmin();
  let s: AdminStats | null = null;
  let error = "";
  try {
    s = await getAdminStats();
  } catch (e) {
    console.error("admin overview failed:", e);
    error = "Could not load the overview. Check that the SQL migration has been applied and the server logs.";
  }

  return (
    <PageShell title="Overview" subtitle="Platform summary. All times are UTC.">
      {error && <ErrorNote>{error}</ErrorNote>}
      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total users" value={s.usersTotal.toLocaleString("en-US")} hint={`${s.usersToday} today · ${s.usersWeek} in 7 days`} />
            <StatCard label="Total user balances" value={fmtMoney(s.totalBalance)} hint="Sum of all USD balances" />
            <StatCard label="Manual credits (30d)" value={fmtMoney(s.credits30d)} tone="up" hint={`${s.adjustments30d} adjustments`} />
            <StatCard label="Manual debits (30d)" value={fmtMoney(s.debits30d)} tone="down" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Panel title="Latest balance adjustments" flush right={<Link href="/admin/adjustments" className="text-[12px] font-semibold text-accent hover:underline">View all</Link>}>
              <LedgerTable rows={s.latestAdjustments} empty="No manual adjustments yet." />
            </Panel>
            <Panel title="Top countries">
              <div className="flex flex-wrap gap-2">
                {s.countries.length === 0 && <span className="text-[13px] text-slate-500">No data yet.</span>}
                {s.countries.map((c) => (
                  <span key={c.country} className="rounded-full bg-ink-800 px-3 py-1 text-[13px] text-slate-200">{c.country} · {c.count}</span>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Newest accounts" flush right={<Link href="/admin/users" className="text-[12px] font-semibold text-accent hover:underline">All users</Link>}>
            <TableWrap min={560}>
              <thead className="border-b border-white/[0.06]">
                <tr><th className={TH}>Email</th><th className={TH}>Country</th><th className={TH}>Currency</th><th className={TH}>Created (UTC)</th></tr>
              </thead>
              <tbody>
                {s.latestUsers.map((u) => (
                  <tr key={u.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                    <td className={TD}><Link href={`/admin/users/${u.id}`} className="text-accent hover:underline">{u.email}</Link></td>
                    <td className={TD}>{u.country || "-"}</td>
                    <td className={TD}>{u.currency}</td>
                    <td className={`${TD} text-slate-400`}>{fmtUtc(u.created_at)}</td>
                  </tr>
                ))}
                {s.latestUsers.length === 0 && <EmptyRow cols={4} text="No accounts yet." />}
              </tbody>
            </TableWrap>
          </Panel>
        </>
      )}
    </PageShell>
  );
}
