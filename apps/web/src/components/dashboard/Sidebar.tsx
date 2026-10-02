"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartIcon, CloseIcon, DotsIcon, SupportIcon, TrophyIcon, UserIcon } from "@/components/ui/Icons";
import { HelpIcon } from "./DashIcons";

type NavItem = { href: string; label: string; icon: ReactNode };

/** Every item is a real page (route). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Trade", icon: <ChartIcon size={22} /> },
  { href: "/dashboard/support", label: "Support", icon: <SupportIcon size={22} /> },
  { href: "/dashboard/account", label: "Account", icon: <UserIcon size={22} /> },
  { href: "/dashboard/tournaments", label: "Tournaments", icon: <TrophyIcon size={22} /> },
  { href: "/dashboard/more", label: "More", icon: <DotsIcon size={22} /> },
  { href: "/dashboard/help", label: "Help", icon: <HelpIcon size={22} /> },
];

const isActive = (href: string, pathname: string) =>
  href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`);

type SidebarProps = {
  drawerOpen: boolean;
  onCloseDrawer: () => void;
};

/** Fixed icon rail on desktop, slide-over drawer on tablet/mobile. */
export function Sidebar({ drawerOpen, onCloseDrawer }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, onCloseDrawer]);

  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden w-[72px] shrink-0 flex-col items-stretch gap-1 border-r border-white/[0.06] bg-ink-900 py-2 lg:flex"
      >
        {NAV_ITEMS.map((item) => {
          const on = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                on ? "bg-ink-800 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {on && <span className="absolute left-0 top-2 h-[calc(100%-1rem)] w-[3px] rounded-r bg-brand" />}
              <span className={on ? "text-brand" : ""}>{item.icon}</span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onCloseDrawer} aria-hidden="true" />
          <nav
            aria-label="Primary"
            className="absolute inset-y-0 left-0 flex w-64 max-w-[80vw] flex-col gap-1 border-r border-white/10 bg-ink-900 p-3 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">Menu</span>
              <button
                type="button"
                onClick={onCloseDrawer}
                aria-label="Close menu"
                className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            {NAV_ITEMS.map((item) => {
              const on = isActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseDrawer}
                  aria-current={on ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                    on ? "bg-ink-700 text-white" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className={on ? "text-brand" : "text-slate-400"}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}

const MOBILE_HREFS = ["/dashboard", "/dashboard/support", "/dashboard/account", "/dashboard/tournaments", "/dashboard/more"];

/** Bottom navigation for phones. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-ink-900 pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      {NAV_ITEMS.filter((i) => MOBILE_HREFS.includes(i.href)).map((item) => {
        const on = isActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wide ${
              on ? "text-brand" : "text-slate-400"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
