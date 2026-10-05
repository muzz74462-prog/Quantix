import Link from "next/link";
import type { LedgerRow } from "@/lib/adminData";
import { fmtMoney, fmtSigned, fmtUtc } from "@/lib/adminFormat";
import { Badge, EmptyRow, TD, TH, TableWrap } from "./ui";

const TYPE: Record<LedgerRow["entry_type"], { label: string; tone: "green" | "red" | "amber" }> = {
  deposit: { label: "Deposit", tone: "green" },
  withdrawal: { label: "Withdrawal", tone: "red" },
  admin_credit: { label: "Manual add", tone: "amber" },
  admin_debit: { label: "Manual deduct", tone: "amber" },
};

export function LedgerTable({ rows, showUser = true, empty = "No transactions yet." }: { rows: LedgerRow[]; showUser?: boolean; empty?: string }) {
  const cols = showUser ? 9 : 8;
  return (
    <TableWrap min={showUser ? 1100 : 980}>
      <thead className="border-b border-white/[0.06]">
        <tr>
          <th className={TH}>Time (UTC)</th>
          {showUser && <th className={TH}>User</th>}
          <th className={TH}>Type</th>
          <th className={`${TH} text-right`}>Amount</th>
          <th className={`${TH} text-right`}>Previous</th>
          <th className={`${TH} text-right`}>New</th>
          <th className={TH}>Reason / note</th>
          <th className={TH}>Admin</th>
          <th className={TH}>Ledger ID</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const t = TYPE[r.entry_type];
          const credit = r.direction === "credit";
          return (
            <tr key={r.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
              <td className={`${TD} whitespace-nowrap text-slate-400`}>{fmtUtc(r.created_at)}</td>
              {showUser && (
                <td className={TD}>
                  <Link href={`/admin/users/${r.user_id}`} className="text-accent hover:underline">{r.users?.email ?? r.user_id}</Link>
                </td>
              )}
              <td className={TD}><Badge tone={t.tone}>{t.label}</Badge></td>
              <td className={`${TD} text-right font-semibold tabular-nums ${credit ? "text-up" : "text-down"}`}>{fmtSigned(credit ? r.amount : -r.amount)}</td>
              <td className={`${TD} text-right tabular-nums text-slate-400`}>{fmtMoney(r.previous_balance)}</td>
              <td className={`${TD} text-right tabular-nums text-white`}>{fmtMoney(r.new_balance)}</td>
              <td className={`${TD} max-w-[320px]`}>
                <div className="text-white">{r.reason}</div>
                {r.note && <div className="mt-0.5 text-[12px] text-slate-400">{r.note}</div>}
              </td>
              <td className={`${TD} whitespace-nowrap text-slate-300`}>{r.admin_email ?? <span className="text-slate-500">system</span>}</td>
              <td className={`${TD} font-mono text-[11px] text-slate-500`} title={r.id}>{r.id.slice(0, 8)}</td>
            </tr>
          );
        })}
        {rows.length === 0 && <EmptyRow cols={cols} text={empty} />}
      </tbody>
    </TableWrap>
  );
}
