import { LedgerPage } from "@/components/admin/LedgerPage";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  return (
    <LedgerPage
      title="Deposits"
      subtitle="Recorded deposits and manually credited funds. Manual credits are labelled."
      basePath="/admin/deposits"
      types={["deposit", "admin_credit"]}
      empty="No deposits or manual credits yet."
      searchParams={searchParams}
    />
  );
}
