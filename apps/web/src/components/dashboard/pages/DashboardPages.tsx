"use client";

import { useEffect, useState, type ReactNode } from "react";
import { formatMoney } from "@/lib/demoTrading";
import { useDashboard } from "../DashboardContext";
import { DepositPage } from "../funds/DepositPage";
import { WithdrawPage } from "../funds/WithdrawPage";

export const SUPPORT_EMAIL = "pakistan.support@quantix.com";

const PRIZES = [
  { place: "1st", amount: 1000, tone: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  { place: "2nd", amount: 500, tone: "border-slate-300/30 bg-slate-300/10 text-slate-200" },
  { place: "3rd", amount: 300, tone: "border-orange-400/30 bg-orange-400/10 text-orange-300" },
  { place: "4th", amount: 200, tone: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
  { place: "5th", amount: 100, tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
];

function TournamentBox({
  title,
  feeLabel,
  joinedLabel,
  buttonLabel,
  accent,
  fee,
}: {
  title: string;
  feeLabel: string;
  joinedLabel: ReactNode;
  buttonLabel: string;
  accent: "amber" | "green";
  fee: number;
}) {
  const { chargeLive } = useDashboard();
  const [status, setStatus] = useState<"idle" | "loading" | "joined" | "insufficient">("idle");
  const joined = status === "joined";
  const handleJoin = () => {
    if (status === "loading" || status === "joined") return;
    if (fee > 0) {
      setStatus(chargeLive(fee) ? "joined" : "insufficient");
      return;
    }
    setStatus("loading");
    setTimeout(() => setStatus("joined"), 3000);
  };
  const accentBox = accent === "amber" ? "border-amber-400/30 bg-amber-400/10" : "border-emerald-400/30 bg-emerald-400/10";
  const accentText = accent === "amber" ? "text-amber-300" : "text-emerald-300";
  const btn = accent === "amber" ? "bg-amber-400 text-ink-950 hover:bg-amber-300" : "bg-emerald-500 text-white hover:bg-emerald-400";
  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className={`rounded-lg border p-4 ${accentBox}`}>
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${accentText}`}>{title}</p>
        <p className="mt-1 text-lg font-bold text-white">{feeLabel}</p>
        <p className="mt-1 text-[13px] text-slate-300">{joinedLabel}</p>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Prizes</p>
        <ul className="space-y-2">
          {PRIZES.map((p) => (
            <li key={p.place} className={`flex items-center justify-between rounded-md border px-4 py-2.5 ${p.tone}`}>
              <span className="text-[14px] font-bold">{p.place} place</span>
              <span className="text-[16px] font-bold">{formatMoney(p.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        disabled={status === "loading" || joined}
        onClick={handleJoin}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-md text-[15px] font-bold transition-colors disabled:cursor-default ${
          joined ? "bg-emerald-500/20 text-emerald-300" : `${btn} disabled:opacity-70`
        }`}
      >
        {status === "loading" && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        )}
        {status === "loading" ? "Loading..." : joined ? "Successfully joined ✓" : buttonLabel}
      </button>
      {status === "insufficient" && (
        <p role="alert" className="text-center text-[13px] font-semibold text-down">
          Insufficient balance in your real account.
        </p>
      )}
    </div>
  );
}

export function PageFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="h-full overflow-y-auto bg-ink-950">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-slate-400">{subtitle}</p>}
        <div className="mt-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-white/[0.08] bg-ink-800 p-5 ${className}`}>{children}</div>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 first:pt-0 last:border-0 last:pb-0">
      <span className="text-[13px] text-slate-400">{label}</span>
      <span className="min-w-0 break-all text-right text-[14px] font-semibold text-white">{children}</span>
    </div>
  );
}

export function SupportPage() {
  return (
    <PageFrame title="Support" subtitle="We're here to help.">
      <Card>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Email support</p>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-1 block break-all text-[18px] font-bold text-accent hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </Card>
      <p className="rounded-lg border border-brand/30 bg-brand/10 p-5 text-[14px] leading-relaxed text-slate-100">
        Send us an email here if you have any problem. Our support team is open 24/7, and you will get a reply.
      </p>
    </PageFrame>
  );
}

export function AccountPage() {
  const { user, demoBalance } = useDashboard();
  return (
    <PageFrame title="My account" subtitle="The details you used to register.">
      <Card>
        {user ? (
          <>
            <Row label="Email">{user.email}</Row>
            <Row label="Password">
              <span aria-label="Password hidden" className="tracking-[0.25em]">
                ••••••••
              </span>
            </Row>
            {user.country && <Row label="Country">{user.country}</Row>}
            <Row label="Currency">{user.currency}</Row>
          </>
        ) : (
          <p className="text-[14px] leading-relaxed text-slate-300">
            Your account details will appear here after you sign up and open the dashboard.
          </p>
        )}
      </Card>
      <Card>
        <Row label="Demo balance">{formatMoney(demoBalance)}</Row>
        <Row label="Live account">Placeholder (no real funds)</Row>
      </Card>
      <p className="text-[12px] leading-snug text-slate-500">
        Your password is hidden for security and is never stored. This is a front-end prototype.
      </p>
    </PageFrame>
  );
}

export function TournamentsPage() {
  const [players, setPlayers] = useState(347299);
  useEffect(() => {
    const id = setInterval(() => setPlayers((n) => n + 1 + Math.floor(Math.random() * 3)), 4000);
    return () => clearInterval(id);
  }, []);
  const start = new Date(Date.now() + 15 * 86400000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <PageFrame title="Tournaments" subtitle="Compete against other traders for the top prizes.">
      <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">Next tournament</p>
        <p className="mt-1 text-xl font-bold text-white">Tournament starts after 2 days</p>
        
      </div>
      <TournamentBox
        title="Paid tournament"
        feeLabel="$50 fee for joining this tournament"
        joinedLabel="Only 6 players have joined so far"
        buttonLabel="Join now - $50 fee"
        accent="amber"
        fee={50}
      />
      
      <p className="text-[12px] text-slate-500">Real Fundz 1000$ From Quantix</p>
    </PageFrame>
  );
}

export function MorePage() {
  const { logout } = useDashboard();
  return (
    <PageFrame title="More" subtitle="Account actions.">
      <Card>
        <button
          type="button"
          onClick={logout}
          className="flex h-12 w-full items-center justify-center rounded-md border border-down/40 bg-down/10 text-[15px] font-bold text-down transition-colors hover:bg-down/20"
        >
          Log out
        </button>
        <p className="mt-3 text-[12px] text-slate-500">You will be taken back to the sign up / login page.</p>
      </Card>
    </PageFrame>
  );
}

export function HelpPage() {
  return (
    <PageFrame title="Help" subtitle="Need a hand?">
      <Card>
        <p className="text-[14px] leading-relaxed text-slate-300">
          For any question, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-accent hover:underline">
            {SUPPORT_EMAIL}
          </a>
          . A full help center will be connected later.
        </p>
      </Card>
    </PageFrame>
  );
}

/** Deposit / Withdraw routes render the funds pages in ../funds. */
export function FundsPage({ initialTab = "deposit" }: { initialTab?: "deposit" | "withdraw" }) {
  return initialTab === "withdraw" ? <WithdrawPage /> : <DepositPage />;
}
