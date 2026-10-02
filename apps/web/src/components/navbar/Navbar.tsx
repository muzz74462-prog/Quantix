"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronDownIcon, CloseIcon, GlobeIcon, MenuIcon } from "@/components/ui/Icons";
import { NAV_LINKS } from "@/lib/content";

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-1 focus:text-ink-950"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-2 text-[13px] font-semibold text-slate-200 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="secondary" size="sm">Log in</ButtonLink>
          <ButtonLink href="/signup" variant="primary" size="sm">Sign up</ButtonLink>
          <button
            type="button"
            className="ml-1 inline-flex h-8 items-center gap-1 rounded-md px-2 text-[13px] font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Language: English"
          >
            <GlobeIcon size={15} /> EN <ChevronDownIcon size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ButtonLink href="/signup" variant="primary" size="sm">Sign up</ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-200 hover:bg-white/5"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-white/[0.06] bg-ink-950 md:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-[1200px] flex-col px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-[15px] font-semibold text-slate-200 hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-white/[0.06] pt-3">
              <ButtonLink href="/login" variant="secondary" size="md" className="flex-1">Log in</ButtonLink>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
                aria-label="Language: English"
              >
                <GlobeIcon size={16} /> EN
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
