import Link from "next/link";
import type { ReactNode } from "react";

const TABS = [
  { id: "deposit" as const, label: "Deposit", href: "/dashboard/deposit" },
  { id: "withdraw" as const, label: "Withdraw", href: "/dashboard/withdraw" },
];

export function FundsLayout({
  active,
  title,
  subtitle,
  children,
}: {
  active: "deposit" | "withdraw";
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-ink-950">
      <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-white">{title}</h1>
            <p className="mt-1.5 text-[14px] leading-snug text-slate-400">{subtitle}</p>
          </div>
          <nav aria-label="Funds" className="inline-flex rounded-lg bg-white/[0.05] p-1">
            {TABS.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                aria-current={active === t.id ? "page" : undefined}
                className={`rounded-md px-4 py-1.5 text-[13px] font-bold transition-colors ${
                  active === t.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 space-y-5">{children}</div>
      </div>
    </div>
  );
}

export function FundsCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-lg border border-white/[0.08] bg-ink-800 p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[13px] font-medium text-slate-400">{children}</p>;
}
