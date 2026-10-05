/**
 * Admin authentication (server only).
 * - Admin accounts live in public.admin_users (separate from normal users).
 * - A login creates a row in public.admin_sessions; the cookie holds a random token whose
 *   sha256 is stored in the DB, so sessions can expire, be revoked, and are never derived from a password.
 * - Every admin page and API route calls getAdmin() / requireAdminApi() itself. middleware.ts is only
 *   a first, cheap gate.
 */
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/supabaseAdmin";

export const ADMIN_COOKIE = "qx_admin_session";
export const SESSION_HOURS = 8;
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

export type AdminRole = "super_admin" | "admin" | "support";
export type AdminIdentity = { id: string; email: string; role: AdminRole };

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const a = Buffer.from(hashPassword(password, salt), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function canAdjust(role: AdminRole): boolean {
  return role === "super_admin" || role === "admin";
}

export function clientIp(req: Request): string | null {
  return (
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

export async function createAdminSession(adminId: string, req: Request): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const { error } = await db()
    .from("admin_sessions")
    .insert({
      admin_id: adminId,
      token_hash: sha256(token),
      expires_at: new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString(),
      ip: clientIp(req),
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });
  if (error) throw error;
  return token;
}

export async function revokeAdminSession(token: string): Promise<void> {
  await db().from("admin_sessions").update({ revoked_at: new Date().toISOString() }).eq("token_hash", sha256(token));
}

type SessionRow = {
  expires_at: string;
  revoked_at: string | null;
  admin_users: { id: string; email: string; role: AdminRole; is_active: boolean } | null;
};

export async function adminFromToken(token: string | undefined | null): Promise<AdminIdentity | null> {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const { data, error } = await db()
    .from("admin_sessions")
    .select("expires_at, revoked_at, admin_users(id, email, role, is_active)")
    .eq("token_hash", sha256(token))
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as SessionRow;
  const a = row.admin_users;
  if (!a || !a.is_active) return null;
  if (row.revoked_at || new Date(row.expires_at).getTime() <= Date.now()) return null;
  return { id: a.id, email: a.email, role: a.role };
}

/** For server components / pages. Returns null when not logged in. */
export async function getAdmin(): Promise<AdminIdentity | null> {
  return adminFromToken(cookies().get(ADMIN_COOKIE)?.value);
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * For admin API routes. Returns the admin, or a ready-made error response.
 * Mutating requests must come from the same origin (CSRF defence on top of SameSite=Strict).
 */
export async function requireAdminApi(
  req: Request,
  opts: { mutating?: boolean; needsAdjust?: boolean } = {},
): Promise<{ admin: AdminIdentity } | { error: NextResponse }> {
  const admin = await getAdmin();
  if (!admin) return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  if (opts.mutating && !sameOrigin(req)) {
    return { error: NextResponse.json({ ok: false, error: "Bad origin" }, { status: 403 }) };
  }
  if (opts.needsAdjust && !canAdjust(admin.role)) {
    return { error: NextResponse.json({ ok: false, error: "Your role cannot adjust balances." }, { status: 403 }) };
  }
  return { admin };
}

export async function logAudit(e: {
  adminId: string | null;
  adminEmail: string | null;
  action: string;
  targetUserId?: string | null;
  details?: Record<string, unknown>;
  ip?: string | null;
}): Promise<void> {
  try {
    await db().from("admin_audit_logs").insert({
      admin_id: e.adminId,
      admin_email: e.adminEmail,
      action: e.action,
      target_user_id: e.targetUserId ?? null,
      details: e.details ?? {},
      ip: e.ip ?? null,
    });
  } catch (err) {
    console.error("audit log failed:", err);
  }
}
