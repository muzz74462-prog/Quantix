import { LedgerPage } from "@/components/admin/LedgerPage";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  return (
    <LedgerPage
      title="Withdrawals"
      subtitle="Recorded withdrawals and manually debited funds. Manual debits are labelled."
      basePath="/admin/withdrawals"
      types={["withdrawal", "admin_debit"]}
      empty="No withdrawals or manual debits yet."
      searchParams={searchParams}
    />
  );
}
