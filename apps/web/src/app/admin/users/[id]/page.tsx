import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requirePageAdmin } from "@/lib/adminPage";
import { logAudit, canAdjust } from "@/lib/adminAuth";
import { getUserDetail } from "@/lib/adminData";
import { fmtMoney, fmtSigned, fmtUtc } from "@/lib/adminFormat";
import { AdjustBalance } from "@/components/admin/AdjustBalance";
import { LedgerTable } from "@/components/admin/LedgerTable";
import { Badge, PageShell, Panel } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-white/[0.06] py-2 first:border-t-0 first:pt-0">
      <dt className="text-[12px] text-slate-400">{k}</dt>
      <dd className="min-w-0 break-all text-right text-[13px] text-white">{children}</dd>
    </div>
  );
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const admin = await requirePageAdmin();
  const d = await getUserDetail(params.id);
  if (!d) notFound();
  const { profile, summary, ledger } = d;

  // Viewing a user's financial data is itself an auditable action.
  const h = headers();
  await logAudit({
    adminId: admin.id, adminEmail: admin.email, action: "user.view", targetUserId: profile.id,
    ip: h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  });

  const balance = summary?.balance ?? 0;
  const status = summary?.status ?? "active";
  const deposits = ledger.filter((l) => l.entry_type === "deposit" || l.entry_type === "admin_credit");
  const withdrawals = ledger.filter((l) => l.entry_type === "withdrawal" || l.entry_type === "admin_debit");

  return (
    <PageShell
      title={profile.email}
      subtitle="Account detail. All times are UTC."
      actions={<Link href="/admin/users" className="h-9 rounded-md bg-ink-700 px-4 text-[13px] font-bold leading-9 text-white hover:bg-ink-600">← All users</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile">
          <dl>
            <Row k="User ID"><span className="font-mono text-[12px]">{profile.id}</span></Row>
            <Row k="Email">{profile.email}</Row>
            <Row k="Country">{profile.country || "-"}</Row>
            <Row k="Currency">{profile.currency}</Row>
            <Row k="Account status"><Badge tone={status === "active" ? "green" : "amber"}>{status}</Badge></Row>
            <Row k="Created">{fmtUtc(profile.created_at)}</Row>
          </dl>
        </Panel>

        <Panel title="Balance">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Live balance (USD)</div>
              <div className="mt-1 text-[34px] font-extrabold leading-none tabular-nums text-white">{fmtMoney(balance)}</div>
            </div>
            <AdjustBalance userId={profile.id} email={profile.email} balance={balance} canAdjust={canAdjust(admin.role)} />
          </div>
          <dl className="mt-4">
            <Row k="Total deposited">{fmtMoney(summary?.total_deposited ?? 0)}</Row>
            <Row k="Total withdrawn">{fmtMoney(summary?.total_withdrawn ?? 0)}</Row>
            <Row k="Manual adjustments (net)">{summary && summary.manual_net !== 0 ? fmtSigned(summary.manual_net) : "-"}</Row>
          </dl>
        </Panel>
      </div>

      <Panel title="Balance adjustment history" flush right={<span className="text-[11px] text-slate-500">Manual add / deduct, immutable</span>}>
        <LedgerTable rows={ledger.filter((l) => l.entry_type === "admin_credit" || l.entry_type === "admin_debit")} showUser={false} empty="No manual adjustments for this user." />
      </Panel>
      <Panel title="Deposit history" flush right={<span className="text-[11px] text-slate-500">Deposits and manual additions</span>}>
        <LedgerTable rows={deposits} showUser={false} empty="No deposits or manual credits." />
      </Panel>
      <Panel title="Withdrawal history" flush right={<span className="text-[11px] text-slate-500">Withdrawals and manual deductions</span>}>
        <LedgerTable rows={withdrawals} showUser={false} empty="No withdrawals or manual debits." />
      </Panel>
      <Panel title="Trading / order history">
        <p className="text-[13px] text-slate-400">
          No server-side trading records exist yet: the platform currently runs demo trades in the browser only. This section will list orders and P&amp;L once trades are stored in the database.
        </p>
      </Panel>
      <Panel title="Balance transaction history" flush right={<span className="text-[11px] text-slate-500">Latest 200 entries, immutable</span>}>
        <LedgerTable rows={ledger} showUser={false} empty="No balance transactions yet." />
      </Panel>
    </PageShell>
  );
}
