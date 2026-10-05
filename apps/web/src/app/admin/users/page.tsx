import Link from "next/link";
import { requirePageAdmin } from "@/lib/adminPage";
import { canAdjust } from "@/lib/adminAuth";
import { AdjustBalance } from "@/components/admin/AdjustBalance";
import { cleanQ, listUsers, pageNum, type UserRow } from "@/lib/adminData";
import { fmtMoney, fmtSigned, fmtUtc } from "@/lib/adminFormat";
import { Badge, EmptyRow, ErrorNote, PageShell, Pagination, Panel, SearchForm, TD, TH, TableWrap } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  const admin = await requirePageAdmin();
  const mayAdjust = canAdjust(admin.role);
  const q = cleanQ(searchParams.q);
  const page = pageNum(searchParams.page);
  let rows: UserRow[] = [];
  let total = 0;
  let error = "";
  try {
    ({ rows, total } = await listUsers(q, page));
  } catch (e) {
    console.error("list users failed:", e);
    error = "Could not load users.";
  }

  return (
    <PageShell title="Users" subtitle="Search by email or exact user ID.">
      <SearchForm q={q} placeholder="Search email or user ID…" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <Panel flush>
        <TableWrap min={1240}>
          <thead className="border-b border-white/[0.06]">
            <tr>
              <th className={TH}>Email</th>
              <th className={TH}>User ID</th>
              <th className={TH}>Country</th>
              <th className={TH}>Currency</th>
              <th className={TH}>Status</th>
              <th className={TH}>Created (UTC)</th>
              <th className={`${TH} text-right`}>Balance (USD)</th>
              <th className={`${TH} text-right`}>Deposited</th>
              <th className={`${TH} text-right`}>Withdrawn</th>
              <th className={`${TH} text-right`} title="Net of manual additions minus manual deductions">Manual net</th>
              {mayAdjust && <th className={`${TH} text-center`}>Edit</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                <td className={TD}><Link href={`/admin/users/${u.id}`} className="font-semibold text-accent hover:underline">{u.email}</Link></td>
                <td className={`${TD} font-mono text-[11px] text-slate-500`}>{u.id}</td>
                <td className={TD}>{u.country || "-"}</td>
                <td className={TD}>{u.currency}</td>
                <td className={TD}><Badge tone={u.status === "active" ? "green" : "amber"}>{u.status}</Badge></td>
                <td className={`${TD} whitespace-nowrap text-slate-400`}>{fmtUtc(u.created_at)}</td>
                <td className={`${TD} text-right font-semibold tabular-nums text-white`}>{fmtMoney(u.balance)}</td>
                <td className={`${TD} text-right tabular-nums`}>{fmtMoney(u.total_deposited)}</td>
                <td className={`${TD} text-right tabular-nums`}>{fmtMoney(u.total_withdrawn)}</td>
                <td className={`${TD} text-right tabular-nums ${u.manual_net > 0 ? "text-up" : u.manual_net < 0 ? "text-down" : "text-slate-500"}`}>{u.manual_net === 0 ? "-" : fmtSigned(u.manual_net)}</td>
                {mayAdjust && (
                  <td className={`${TD} text-center`}>
                    <AdjustBalance userId={u.id} email={u.email} balance={u.balance} canAdjust={mayAdjust} variant="icon" />
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && !error && <EmptyRow cols={mayAdjust ? 11 : 10} text={q ? "No users match your search." : "No users yet."} />}
          </tbody>
        </TableWrap>
        <Pagination basePath="/admin/users" params={{ q }} page={page} total={total} />
      </Panel>
      <p className="text-[12px] text-slate-500">Trading P&amp;L is not shown: trades are demo-only and are not stored on the server yet.</p>
    </PageShell>
  );
}
