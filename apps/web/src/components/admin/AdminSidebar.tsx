"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "./AdminClient";

const ICON: Record<string, string> = {
  overview: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  users: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21a8 8 0 0 1 16 0",
  deposits: "M12 3v12m0 0-4-4m4 4 4-4M4 21h16",
  withdrawals: "M12 15V3m0 0-4 4m4-4 4 4M4 21h16",
  adjustments: "M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6",
  audit: "M9 12l2 2 4-4M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z",
};

const NAV = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/deposits", label: "Deposits", icon: "deposits" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: "withdrawals" },
  { href: "/admin/adjustments", label: "Balance adjustments", icon: "adjustments" },
  { href: "/admin/audit-logs", label: "Audit logs", icon: "audit" },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="mt-6 flex flex-col gap-1" aria-label="Admin">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-semibold transition-colors ${
              active ? "bg-brand/15 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-brand" : ""} aria-hidden="true">
              <path d={ICON[n.icon]} />
            </svg>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ email, role }: { email: string; role: string }) {
  const [open, setOpen] = useState(false);
  const who = (
    <div className="mt-auto border-t border-white/[0.06] pt-4">
      <div className="truncate text-[12px] font-semibold text-white" title={email}>{email}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">{role.replace("_", " ")}</div>
      <LogoutButton className="mt-3 h-9 w-full rounded-md bg-ink-700 text-[13px] font-bold text-white hover:bg-ink-600" />
    </div>
  );
  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-ink-900 px-4 lg:hidden">
        <span className="text-[14px] font-extrabold tracking-wide text-white">QUANTIX <span className="text-brand">Admin</span></span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="h-9 w-9 rounded-md bg-ink-700 text-white">
          <svg className="mx-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-ink-900 p-4">
            <span className="text-[14px] font-extrabold tracking-wide text-white">QUANTIX <span className="text-brand">Admin</span></span>
            <Nav onNavigate={() => setOpen(false)} />
            {who}
          </aside>
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900 p-4 lg:flex">
        <span className="text-[15px] font-extrabold tracking-wide text-white">QUANTIX <span className="text-brand">Admin</span></span>
        <Nav />
        {who}
      </aside>
    </>
  );
}
