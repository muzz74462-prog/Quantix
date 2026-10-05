/** Read/write helpers for the admin pages. SERVER ONLY. Callers must already have verified the admin. */
import { db } from "@/lib/supabaseAdmin";

export const PAGE_SIZE = 25;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const escLike = (s: string) => s.replace(/[\\%_]/g, (c) => "\\" + c);
export const cleanQ = (s: string | string[] | undefined): string =>
  (Array.isArray(s) ? s[0] : s ?? "").trim().slice(0, 100);
export const pageNum = (s: string | string[] | undefined): number => {
  const n = parseInt(Array.isArray(s) ? s[0] : s ?? "1", 10);
  return Number.isFinite(n) && n > 0 && n < 100000 ? n : 1;
};

export type UserRow = {
  id: string; email: string; country: string | null; currency: string | null; created_at: string;
  status: string; balance: number; total_deposited: number; total_withdrawn: number; manual_net: number;
  total_count: number;
};

export async function listUsers(q: string, page: number) {
  const { data, error } = await db().rpc("admin_list_users", {
    p_search: q ? escLike(q) : null,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  if (error) throw error;
  const rows = (data ?? []) as UserRow[];
  return { rows, total: rows[0] ? Number(rows[0].total_count) : 0 };
}

export type LedgerRow = {
  id: string; user_id: string; entry_type: "deposit" | "withdrawal" | "admin_credit" | "admin_debit";
  direction: "credit" | "debit"; amount: number; currency: string; previous_balance: number; new_balance: number;
  reason: string; note: string | null; admin_email: string | null; created_at: string;
  users?: { email: string } | null;
};

const LEDGER_COLS =
  "id,user_id,entry_type,direction,amount,currency,previous_balance,new_balance,reason,note,admin_email,created_at";

export async function listLedger(opts: { types: string[]; q: string; page: number }) {
  let query = db()
    .from("balance_ledger")
    .select(`${LEDGER_COLS},users!inner(email)`, { count: "exact" })
    .in("entry_type", opts.types)
    .order("created_at", { ascending: false })
    .range((opts.page - 1) * PAGE_SIZE, opts.page * PAGE_SIZE - 1);
  if (opts.q) query = query.ilike("users.email", `%${escLike(opts.q)}%`);
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as unknown as LedgerRow[], total: count ?? 0 };
}

export type AuditRow = {
  id: string; admin_email: string | null; action: string; target_user_id: string | null;
  details: Record<string, unknown>; ip: string | null; created_at: string;
};

export async function listAudit(opts: { q: string; page: number }) {
  let query = db()
    .from("admin_audit_logs")
    .select("id,admin_email,action,target_user_id,details,ip,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((opts.page - 1) * PAGE_SIZE, opts.page * PAGE_SIZE - 1);
  const safe = opts.q.replace(/[^a-zA-Z0-9@._:\- ]/g, "");
  if (safe) query = query.or(`admin_email.ilike.*${safe}*,action.ilike.*${safe}*`);
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as AuditRow[], total: count ?? 0 };
}

export async function getUserDetail(id: string) {
  if (!UUID_RE.test(id)) return null;
  const [profile, summary, ledger] = await Promise.all([
    db().from("users").select("id,email,country,currency,created_at").eq("id", id).maybeSingle(),
    db().rpc("admin_list_users", { p_search: id, p_limit: 5, p_offset: 0 }),
    db()
      .from("balance_ledger")
      .select(LEDGER_COLS)
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  if (profile.error) throw profile.error;
  if (!profile.data) return null;
  if (summary.error) throw summary.error;
  if (ledger.error) throw ledger.error;
  const s = ((summary.data ?? []) as UserRow[]).find((r) => r.id === id) ?? null;
  return { profile: profile.data as Pick<UserRow, "id" | "email" | "country" | "currency" | "created_at">, summary: s, ledger: (ledger.data ?? []) as LedgerRow[] };
}

export type AdjustResult = { ledgerId: string; previous: number; next: number; createdAt: string; replayed: boolean };

export async function adjustBalance(a: {
  adminId: string; userId: string; direction: "credit" | "debit"; amount: string;
  reason: string; note: string; idempotencyKey: string; ip: string | null;
}): Promise<AdjustResult> {
  const { data, error } = await db().rpc("admin_adjust_balance", {
    p_admin_id: a.adminId, p_user_id: a.userId, p_direction: a.direction, p_amount: a.amount,
    p_currency: "USD", p_reason: a.reason, p_note: a.note || null, p_idempotency_key: a.idempotencyKey, p_ip: a.ip,
  });
  if (error) throw error;
  const r = (Array.isArray(data) ? data[0] : data) as
    | { out_ledger_id: string; out_previous: number; out_new: number; out_created_at: string; out_replayed: boolean }
    | undefined;
  if (!r) throw new Error("empty result");
  return { ledgerId: r.out_ledger_id, previous: Number(r.out_previous), next: Number(r.out_new), createdAt: r.out_created_at, replayed: r.out_replayed };
}
