import { requirePageAdmin } from "@/lib/adminPage";
import { cleanQ, listLedger, pageNum, type LedgerRow } from "@/lib/adminData";
import { LedgerTable } from "./LedgerTable";
import { ErrorNote, PageShell, Pagination, Panel, SearchForm } from "./ui";

/** Shared server page for the Deposits / Withdrawals / Balance adjustments lists. */
export async function LedgerPage(props: {
  title: string; subtitle: string; basePath: string; types: string[]; empty: string;
  searchParams: { q?: string; page?: string };
}) {
  await requirePageAdmin();
  const q = cleanQ(props.searchParams.q);
  const page = pageNum(props.searchParams.page);
  let rows: LedgerRow[] = [];
  let total = 0;
  let error = "";
  try {
    ({ rows, total } = await listLedger({ types: props.types, q, page }));
  } catch (e) {
    console.error(`${props.title} failed:`, e);
    error = "Could not load transactions. Check that the SQL migration has been applied.";
  }
  return (
    <PageShell title={props.title} subtitle={props.subtitle}>
      <SearchForm q={q} placeholder="Filter by user email…" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <Panel flush>
        <LedgerTable rows={rows} empty={props.empty} />
        <Pagination basePath={props.basePath} params={{ q }} page={page} total={total} />
      </Panel>
    </PageShell>
  );
}
