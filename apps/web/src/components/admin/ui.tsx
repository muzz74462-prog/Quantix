import Link from "next/link";
import type { ReactNode } from "react";
import { PAGE_SIZE } from "@/lib/adminData";

export function PageShell({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-[13px] text-slate-400">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function StatCard({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "up" | "down" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1.5 text-[26px] font-extrabold leading-none tabular-nums ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-white"}`}>{value}</div>
      {hint && <div className="mt-2 text-[12px] text-slate-500">{hint}</div>}
    </div>
  );
}

export function Panel({ title, right, children, flush }: { title?: string; right?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <section className="rounded-xl border border-white/10 bg-ink-900">
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-slate-300">{title}</h2>
          {right}
        </header>
      )}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}

const TONES = {
  green: "bg-up/15 text-up",
  red: "bg-down/15 text-down",
  amber: "bg-amber-400/15 text-amber-300",
  blue: "bg-accent/15 text-accent",
  slate: "bg-white/10 text-slate-300",
} as const;

export function Badge({ tone = "slate", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONES[tone]}`}>{children}</span>;
}

export const TH = "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap";
export const TD = "px-4 py-2.5 align-top text-[13px] text-slate-200";

export function TableWrap({ children, min = 760 }: { children: ReactNode; min?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ minWidth: min }}>
        {children}
      </table>
    </div>
  );
}

export function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-[13px] text-slate-500">
        {text}
      </td>
    </tr>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p role="alert" className="rounded-lg border border-down/30 bg-down/10 px-4 py-3 text-[13px] text-down">{children}</p>;
}

export function SearchForm({ q, placeholder, children }: { q: string; placeholder: string; children?: ReactNode }) {
  return (
    <form method="get" className="flex flex-wrap items-center gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        maxLength={100}
        className="h-10 w-full min-w-0 rounded-md bg-ink-800 px-3 text-[13px] text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand sm:w-80"
      />
      {children}
      <button type="submit" className="h-10 rounded-md bg-brand px-4 text-[13px] font-bold text-white hover:bg-brand-hover">Search</button>
      {q && <a href="?" className="h-10 rounded-md bg-ink-700 px-4 text-[13px] font-bold leading-10 text-white hover:bg-ink-600">Clear</a>}
    </form>
  );
}

export function Pagination({ basePath, params, page, total }: { basePath: string; params: Record<string, string>; page: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const btn = "h-9 rounded-md px-3 text-[13px] font-semibold leading-9";
  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3 text-[12px] text-slate-400">
      <span>{total.toLocaleString("en-US")} result{total === 1 ? "" : "s"} · page {Math.min(page, pages)} of {pages}</span>
      <span className="flex gap-2">
        {page > 1 ? <Link href={href(page - 1)} className={`${btn} bg-ink-700 text-white hover:bg-ink-600`}>Previous</Link> : <span className={`${btn} bg-ink-800 text-slate-600`}>Previous</span>}
        {page < pages ? <Link href={href(page + 1)} className={`${btn} bg-ink-700 text-white hover:bg-ink-600`}>Next</Link> : <span className={`${btn} bg-ink-800 text-slate-600`}>Next</span>}
      </span>
    </div>
  );
}
