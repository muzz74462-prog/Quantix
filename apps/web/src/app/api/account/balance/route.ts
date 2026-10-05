import { NextResponse } from "next/server";
import { readUserId } from "@/lib/userSession";
import { db } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only. A user can only ever read their own balance; there is no write endpoint for balances. */
export async function GET() {
  const userId = readUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const { data, error } = await db().from("account_balances").select("balance,currency").eq("user_id", userId).maybeSingle();
  if (error) return NextResponse.json({ ok: false }, { status: 500, headers: { "Cache-Control": "no-store" } });
  const row = data as { balance: number; currency: string } | null;
  return NextResponse.json(
    { ok: true, balance: Number(row?.balance ?? 0), currency: row?.currency ?? "USD" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
