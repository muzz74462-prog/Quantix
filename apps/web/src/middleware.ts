import { NextResponse, type NextRequest } from "next/server";

/**
 * First gate only: no admin cookie -> no access to /admin or /api/admin.
 * The REAL authorization (session lookup in the database, role check) happens inside every
 * admin page and API route. This file just stops anonymous traffic early and sets no-store headers.
 */
const COOKIE = "qx_admin_session";
const PUBLIC = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const p = pathname.replace(/\/+$/, "") || "/";
  if (!PUBLIC.has(p) && !req.cookies.get(COOKIE)?.value) {
    if (p.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
