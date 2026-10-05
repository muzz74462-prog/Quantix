import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE, LOCK_MINUTES, MAX_FAILED_LOGINS, SESSION_HOURS,
  clientIp, createAdminSession, hashPassword, logAudit, verifyPassword,
} from "@/lib/adminAuth";
import { db } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const GENERIC = "Invalid email or password.";
// Used to spend the same time on unknown emails as on real ones.
const DUMMY_SALT = "00000000000000000000000000000000";
const DUMMY_HASH = hashPassword("dummy-password", DUMMY_SALT);

type AdminRow = {
  id: string; email: string; password_salt: string; password_hash: string;
  is_active: boolean; failed_attempts: number; locked_until: string | null;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  const ip = clientIp(req);
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: GENERIC }, { status: 400 });
  }

  try {
    const { data } = await db()
      .from("admin_users")
      .select("id,email,password_salt,password_hash,is_active,failed_attempts,locked_until")
      .eq("email_norm", email)
      .maybeSingle();
    const admin = (data as AdminRow | null) ?? null;

    const locked = !!admin?.locked_until && new Date(admin.locked_until).getTime() > Date.now();
    const passwordOk = admin
      ? verifyPassword(password, admin.password_salt, admin.password_hash)
      : (verifyPassword(password, DUMMY_SALT, DUMMY_HASH), false);

    if (!admin || !admin.is_active || locked || !passwordOk) {
      if (admin && !locked) {
        const attempts = admin.failed_attempts + 1;
        await db()
          .from("admin_users")
          .update({
            failed_attempts: attempts >= MAX_FAILED_LOGINS ? 0 : attempts,
            locked_until:
              attempts >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
          })
          .eq("id", admin.id);
      }
      await logAudit({
        adminId: admin?.id ?? null,
        adminEmail: email,
        action: "admin.login_failed",
        details: { reason: locked ? "locked" : !admin ? "unknown" : !admin.is_active ? "inactive" : "bad_password" },
        ip,
      });
      await new Promise((r) => setTimeout(r, 700));
      return NextResponse.json({ ok: false, error: GENERIC }, { status: 401 });
    }

    await db()
      .from("admin_users")
      .update({ failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
      .eq("id", admin.id);
    const token = await createAdminSession(admin.id, req);
    await logAudit({ adminId: admin.id, adminEmail: admin.email, action: "admin.login", ip });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_HOURS * 3600,
    });
    return res;
  } catch (err) {
    console.error("admin login failed:", err);
    return NextResponse.json({ ok: false, error: "Something went wrong." }, { status: 500 });
  }
}
