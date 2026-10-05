import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminFromToken, clientIp, logAudit, revokeAdminSession } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (token) {
    const admin = await adminFromToken(token);
    await revokeAdminSession(token);
    if (admin) await logAudit({ adminId: admin.id, adminEmail: admin.email, action: "admin.logout", ip: clientIp(req) });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
