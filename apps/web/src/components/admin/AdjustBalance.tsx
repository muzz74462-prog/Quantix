"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fmtMoney, fmtSigned, fmtUtcSec } from "@/lib/adminFormat";

const REASONS = [
  "Deposit credited manually",
  "Delayed deposit",
  "Correction of an error",
  "Bonus / promotion",
  "Refund",
  "Reversal of a previous credit",
  "Other",
];
const AMOUNT_RE = /^\d{1,7}(\.\d{1,2})?$/;
const FIELD = "mt-1.5 w-full rounded-md bg-ink-800 px-3 text-[14px] text-white outline-none ring-1 ring-white/10 focus:ring-brand";

type Receipt = { ledgerId: string; previous: number; next: number; createdAt: string; replayed: boolean };

export function AdjustBalance({
  userId, email, balance, canAdjust, variant = "button",
}: { userId: string; email: string; balance: number; canAdjust: boolean; variant?: "button" | "icon" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reasonPick, setReasonPick] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [note, setNote] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  // One key per intended adjustment: a double click or a retry after a network error can never apply twice.
  const keyRef = useRef<string>("");
  // Synchronous lock: blocks a second click even before React re-renders the disabled button.
  const inFlight = useRef(false);

  if (!canAdjust) {
    return variant === "icon" ? null : <p className="text-[12px] text-slate-500">Your role is read-only: balance adjustments are disabled.</p>;
  }

  const amountOk = AMOUNT_RE.test(amount.trim()) && Number(amount) > 0 && Number(amount) <= 1_000_000;
  const amountNum = amountOk ? Number(amount) : 0;
  const reason = reasonPick === "Other" ? customReason.trim() : reasonPick;
  const projected = direction === "credit" ? balance + amountNum : balance - amountNum;
  const overdraw = amountOk && projected < 0;
  const formError = !amountOk
    ? "Enter a valid USD amount (max 2 decimals, up to $1,000,000)."
    : overdraw
      ? "A deduction cannot exceed the current balance. Balances can never go negative."
      : reason.length < 3
        ? "Enter a reason (at least 3 characters)."
        : note.length > 500
          ? "Note is too long (max 500 characters)."
          : "";

  const reset = () => {
    setStep("form"); setAmount(""); setNote(""); setCustomReason(""); setReasonPick(REASONS[0]);
    setTyped(""); setError(""); setReceipt(null); setDirection("credit"); keyRef.current = "";
  };
  const openDialog = () => {
    reset();
    keyRef.current = crypto.randomUUID();
    setOpen(true);
  };
  const close = () => {
    if (busy) return;
    const refresh = step === "done";
    setOpen(false);
    if (refresh) router.refresh();
  };

  const apply = async () => {
    if (inFlight.current || busy || formError || typed !== "CONFIRM") return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction, amount: amount.trim(), currency: "USD", reason, note: note.trim(),
          confirm: true, idempotencyKey: keyRef.current,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setReceipt({ ledgerId: data.ledgerId, previous: data.previous, next: data.next, createdAt: data.createdAt, replayed: data.replayed });
        setStep("done");
      } else {
        setError(data?.error ?? "The adjustment could not be applied. Nothing was changed.");
        setStep("form");
      }
    } catch {
      setError("Network error. The adjustment may or may not have been applied. Check the ledger before retrying; retrying is safe and will not apply twice.");
      setStep("form");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const isCredit = direction === "credit";

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button" onClick={openDialog} title="Adjust Live Balance" aria-label={`Adjust Live Balance for ${email}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink-700 text-slate-300 transition-colors hover:bg-brand/20 hover:text-white"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
          </svg>
        </button>
      ) : (
        <button type="button" onClick={openDialog} className="h-10 rounded-md bg-brand px-4 text-[13px] font-bold text-white hover:bg-brand-hover">
          Edit balance
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Adjust Live Balance">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/70" onClick={close} />
          <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-900 p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[17px] font-extrabold text-white">Adjust Live Balance</h2>
                <p className="mt-0.5 truncate text-[12px] text-slate-400">{email}</p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="h-8 w-8 shrink-0 rounded-md bg-ink-700 text-slate-300 hover:bg-ink-600">×</button>
            </div>

            {step === "form" && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-md bg-ink-800 px-3 py-2.5">
                  <span className="text-[12px] text-slate-400">Current Live balance (USD)</span>
                  <span className="text-[16px] font-extrabold tabular-nums text-white">{fmtMoney(balance)}</span>
                </div>
                <div role="group" aria-label="Direction" className="grid grid-cols-2 gap-2">
                  {(["credit", "debit"] as const).map((d) => (
                    <button
                      key={d} type="button" onClick={() => setDirection(d)} aria-pressed={direction === d}
                      className={`h-11 rounded-md text-[13px] font-bold ring-1 transition-colors ${
                        direction === d
                          ? d === "credit" ? "bg-up/20 text-up ring-up/50" : "bg-down/20 text-down ring-down/50"
                          : "bg-ink-800 text-slate-400 ring-white/10 hover:text-white"
                      }`}
                    >
                      {d === "credit" ? "Add" : "Deduct"}
                    </button>
                  ))}
                </div>

                <label className="block text-[12px] font-semibold text-slate-300">
                  Amount (USD)
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-slate-500">$</span>
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" className={`${FIELD} h-11 pl-7 tabular-nums`} />
                  </div>
                </label>

                <label className="block text-[12px] font-semibold text-slate-300">
                  Reason
                  <select value={reasonPick} onChange={(e) => setReasonPick(e.target.value)} className={`${FIELD} h-11`}>
                    {REASONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </label>
                {reasonPick === "Other" && (
                  <label className="block text-[12px] font-semibold text-slate-300">
                    Describe the reason
                    <input value={customReason} onChange={(e) => setCustomReason(e.target.value)} maxLength={200} className={`${FIELD} h-11`} />
                  </label>
                )}
                <label className="block text-[12px] font-semibold text-slate-300">
                  Reference / note <span className="font-normal text-slate-500">(e.g. transaction hash, ticket number)</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} className={`${FIELD} py-2`} />
                </label>

                {amountOk && !overdraw && (
                  <div className="flex items-center justify-between rounded-md bg-ink-800 px-3 py-2 text-[13px]">
                    <span className="text-slate-400">Balance after</span>
                    <span className="tabular-nums text-white">{fmtMoney(balance)} → <b>{fmtMoney(projected)}</b></span>
                  </div>
                )}
                {error && <p role="alert" className="rounded-md bg-down/10 px-3 py-2 text-[13px] text-down">{error}</p>}
                {amount && formError && <p className="text-[12px] text-amber-300">{formError}</p>}

                <button
                  type="button" disabled={!!formError} onClick={() => { setError(""); setTyped(""); setStep("confirm"); }}
                  className="h-11 w-full rounded-md bg-brand text-[14px] font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
                <button type="button" onClick={close} className="h-10 w-full rounded-md bg-ink-700 text-[13px] font-bold text-white hover:bg-ink-600">Cancel</button>
                <p className="text-[11px] leading-snug text-slate-500">The balance shown is from when this page loaded. The server always applies the change to the real current balance and rejects anything that would make it negative.</p>
              </div>
            )}

            {step === "confirm" && (
              <div className="mt-4 space-y-4">
                <div role="alert" className={`rounded-lg border p-4 ${isCredit ? "border-amber-400/40 bg-amber-400/10" : "border-down/40 bg-down/10"}`}>
                  <p className={`text-[13px] font-bold uppercase tracking-wide ${isCredit ? "text-amber-300" : "text-down"}`}>
                    Warning: this changes a real account balance
                  </p>
                  <p className="mt-2 text-[14px] leading-snug text-white">
                    You are about to <b>{isCredit ? "ADD" : "DEDUCT"} {fmtMoney(amountNum)}</b> {isCredit ? "to" : "from"} <b>{email}</b>.
                  </p>
                  <p className="mt-2 text-[12px] leading-snug text-slate-300">
                    This creates a permanent ledger entry and an audit record under your admin account. It cannot be edited or deleted. To undo it, a second opposite adjustment is required.
                  </p>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-md bg-ink-800 p-3 text-[13px]">
                  <dt className="text-slate-400">Previous balance</dt><dd className="text-right tabular-nums text-white">{fmtMoney(balance)}</dd>
                  <dt className="text-slate-400">Adjustment</dt><dd className={`text-right font-semibold tabular-nums ${isCredit ? "text-up" : "text-down"}`}>{fmtSigned(isCredit ? amountNum : -amountNum)}</dd>
                  <dt className="text-slate-400">New balance</dt><dd className="text-right font-bold tabular-nums text-white">{fmtMoney(projected)}</dd>
                  <dt className="text-slate-400">Reason</dt><dd className="text-right text-white">{reason}</dd>
                  {note.trim() && (<><dt className="text-slate-400">Note</dt><dd className="text-right text-slate-200">{note.trim()}</dd></>)}
                </dl>
                <label className="block text-[12px] font-semibold text-slate-300">
                  Type <span className="font-mono text-white">CONFIRM</span> to apply
                  <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} className={`${FIELD} h-11 font-mono`} />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={close} disabled={busy} className="h-11 rounded-md bg-ink-700 text-[14px] font-bold text-white hover:bg-ink-600">Cancel</button>
                  <button
                    type="button" onClick={() => void apply()} disabled={busy || typed !== "CONFIRM"}
                    className={`h-11 rounded-md text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${isCredit ? "bg-brand hover:bg-brand-hover" : "bg-down hover:opacity-90"}`}
                  >
                    {busy ? "Applying…" : "Confirm"}
                  </button>
                </div>
                <button type="button" onClick={() => setStep("form")} disabled={busy} className="w-full text-center text-[12px] font-semibold text-slate-400 hover:text-white">← Edit details</button>
              </div>
            )}

            {step === "done" && receipt && (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-up/40 bg-up/10 p-4">
                  <p className="text-[14px] font-bold text-up">{receipt.replayed ? "Already applied (duplicate request ignored)" : "Adjustment applied"}</p>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
                    <dt className="text-slate-400">Previous balance</dt><dd className="text-right tabular-nums text-white">{fmtMoney(receipt.previous)}</dd>
                    <dt className="text-slate-400">Adjustment</dt><dd className="text-right tabular-nums text-white">{fmtSigned(receipt.next - receipt.previous)}</dd>
                    <dt className="text-slate-400">New balance</dt><dd className="text-right font-bold tabular-nums text-white">{fmtMoney(receipt.next)}</dd>
                    <dt className="text-slate-400">Time</dt><dd className="text-right text-white">{fmtUtcSec(receipt.createdAt)}</dd>
                    <dt className="text-slate-400">Ledger ID</dt><dd className="break-all text-right font-mono text-[11px] text-slate-300">{receipt.ledgerId}</dd>
                  </dl>
                </div>
                <button type="button" onClick={close} className="h-11 w-full rounded-md bg-brand text-[14px] font-bold text-white hover:bg-brand-hover">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
