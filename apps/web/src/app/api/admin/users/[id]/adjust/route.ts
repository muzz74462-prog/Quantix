import { NextResponse } from "next/server";
import { clientIp, requireAdminApi } from "@/lib/adminAuth";
import { UUID_RE, adjustBalance } from "@/lib/adminData";

export const runtime = "nodejs";

const AMOUNT_RE = /^\d{1,7}(\.\d{1,2})?$/;
const KEY_RE = /^[A-Za-z0-9_-]{8,64}$/;
const MAX_AMOUNT = 1_000_000;

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(req, { mutating: true, needsAdjust: true });
  if ("error" in auth) return auth.error;
  const { admin } = auth;

  if (!UUID_RE.test(params.id)) return bad("Invalid user id.");
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad("Invalid request.");

  // Server-side validation: nothing from the browser is trusted.
  if (body.confirm !== true) return bad("Confirmation required.");
  const direction = body.direction;
  if (direction !== "credit" && direction !== "debit") return bad("Direction must be credit or debit.");
  if (body.currency !== "USD") return bad("Only USD adjustments are supported.");
  const amountStr = typeof body.amount === "number" ? String(body.amount) : typeof body.amount === "string" ? body.amount.trim() : "";
  if (!AMOUNT_RE.test(amountStr)) return bad("Enter a valid amount with at most 2 decimals.");
  const amountNum = Number(amountStr);
  if (!(amountNum > 0) || amountNum > MAX_AMOUNT) return bad(`Amount must be between 0.01 and ${MAX_AMOUNT.toLocaleString("en-US")}.`);
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length < 3 || reason.length > 200) return bad("Reason must be 3 to 200 characters.");
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (note.length > 500) return bad("Note must be at most 500 characters.");
  const key = typeof body.idempotencyKey === "string" ? body.idempotencyKey : "";
  if (!KEY_RE.test(key)) return bad("Invalid request key. Reload the page and try again.");

  try {
    const r = await adjustBalance({
      adminId: admin.id, userId: params.id, direction, amount: amountStr, reason, note,
      idempotencyKey: key, ip: clientIp(req),
    });
    return NextResponse.json({ ok: true, ...r });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === "23514") return bad("This debit would make the balance negative. Nothing was changed.", 409);
    if (e.code === "P0002") return bad("User account not found.", 404);
    if (e.code === "42501") return bad("Not authorized.", 403);
    if (e.code === "23505") return bad("This request key was already used. Reload the page.", 409);
    console.error("balance adjustment failed:", err);
    return bad("Could not apply the adjustment. Nothing was changed.", 500);
  }
}
