import { LedgerPage } from "@/components/admin/LedgerPage";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  return (
    <LedgerPage
      title="Balance adjustments"
      subtitle="Every manual credit and debit. Entries are permanent and cannot be edited or deleted."
      basePath="/admin/adjustments"
      types={["admin_credit", "admin_debit"]}
      empty="No manual adjustments yet."
      searchParams={searchParams}
    />
  );
}
