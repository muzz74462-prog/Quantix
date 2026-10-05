import Link from "next/link";
import { requirePageAdmin } from "@/lib/adminPage";
import { cleanQ, listAudit, pageNum, type AuditRow } from "@/lib/adminData";
import { fmtUtcSec } from "@/lib/adminFormat";
import { Badge, EmptyRow, ErrorNote, PageShell, Pagination, Panel, SearchForm, TD, TH, TableWrap } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const tone = (a: string) => (a.startsWith("balance.") ? "amber" : a.endsWith("failed") ? "red" : a.startsWith("admin.") ? "blue" : "slate") as "amber" | "red" | "blue" | "slate";

export default async function AuditLogsPage({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  await requirePageAdmin();
  const q = cleanQ(searchParams.q);
  const page = pageNum(searchParams.page);
  let rows: AuditRow[] = [];
  let total = 0;
  let error = "";
  try {
    ({ rows, total } = await listAudit({ q, page }));
  } catch (e) {
    console.error("audit logs failed:", e);
    error = "Could not load audit logs.";
  }

  return (
    <PageShell title="Audit logs" subtitle="Append-only record of admin sign-ins, account views and balance changes (UTC).">
      <SearchForm q={q} placeholder="Filter by admin email or action (e.g. balance.credit)…" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <Panel flush>
        <TableWrap min={980}>
          <thead className="border-b border-white/[0.06]">
            <tr><th className={TH}>Time (UTC)</th><th className={TH}>Admin</th><th className={TH}>Action</th><th className={TH}>Target user</th><th className={TH}>Details</th><th className={TH}>IP</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                <td className={`${TD} whitespace-nowrap text-slate-400`}>{fmtUtcSec(r.created_at)}</td>
                <td className={TD}>{r.admin_email ?? "-"}</td>
                <td className={TD}><Badge tone={tone(r.action)}>{r.action}</Badge></td>
                <td className={TD}>{r.target_user_id ? <Link href={`/admin/users/${r.target_user_id}`} className="font-mono text-[11px] text-accent hover:underline">{r.target_user_id.slice(0, 8)}</Link> : "-"}</td>
                <td className={`${TD} max-w-[360px] break-words font-mono text-[11px] text-slate-400`}>{Object.keys(r.details ?? {}).length ? JSON.stringify(r.details) : "-"}</td>
                <td className={`${TD} text-slate-500`}>{r.ip ?? "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && !error && <EmptyRow cols={6} text="No audit entries yet." />}
          </tbody>
        </TableWrap>
        <Pagination basePath="/admin/audit-logs" params={{ q }} page={page} total={total} />
      </Panel>
    </PageShell>
  );
}
