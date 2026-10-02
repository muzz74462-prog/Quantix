"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Account, AccountType } from "@/types/trading";
import { ChevronDownIcon } from "@/components/ui/Icons";
import { DEMO_MAX_BALANCE, formatMoney } from "@/lib/demoTrading";
import { AccountBalance } from "./AccountBalance";
import { PencilIcon } from "./DashIcons";

type AccountSwitcherProps = {
  accounts: Account[];
  selected: AccountType;
  onSelect: (type: AccountType) => void;
  /** Sets the virtual demo balance. Live balance can never be edited. */
  onSetDemoBalance: (amount: number) => void;
  onDeposit: () => void;
};

export function AccountSwitcher({ accounts, selected, onSelect, onSetDemoBalance, onDeposit }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = accounts.find((a) => a.type === selected) ?? accounts[0];
  const demo = accounts.find((a) => a.type === "demo")!;
  const live = accounts.find((a) => a.type === "live")!;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editing) setEditing(false);
      else setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, editing]);

  const choose = (type: AccountType) => {
    onSelect(type);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setEditing(false);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${current.label}, balance ${formatMoney(current.balance)}. Open account menu`}
        className={`flex h-10 items-center gap-2 rounded-md border border-l-4 px-2.5 transition-colors ${
          current.type === "demo"
            ? "border-amber-400/30 border-l-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
            : "border-sky-400/30 border-l-sky-400 bg-sky-400/10 hover:bg-sky-400/20"
        }`}
      >
        <AccountBalance account={current} align="right" />
        <ChevronDownIcon size={16} className={`text-slate-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Select account"
          className="fixed left-2 right-2 top-[60px] z-50 overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-2xl shadow-black/50 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-[300px]"
        >
          <AccountRow
            account={live}
            active={selected === "live"}
            subtitle="Real-money account"
            tone="sky"
            onChoose={() => choose("live")}
          />
          {live.balance <= 0 && (
            <div className="flex items-center justify-between gap-3 px-4 pb-3 pl-[52px]">
              <span className="text-[12px] text-slate-500">No funds available yet.</span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDeposit();
                }}
                className="text-[12px] font-semibold text-brand hover:underline"
              >
                Deposit
              </button>
            </div>
          )}

          <div className="border-t border-white/[0.08]" />

          <AccountRow
            account={demo}
            active={selected === "demo"}
            subtitle="Virtual funds for practice"
            tone="amber"
            onChoose={() => choose("demo")}
            onEdit={() => setEditing(true)}
          />

          <p className="border-t border-white/[0.08] px-4 py-2.5 text-[11px] leading-snug text-slate-500">
            
          </p>

          {editing && (
            <DemoBalanceDialog
              initial={demo.balance}
              onCancel={() => setEditing(false)}
              onApply={(n) => {
                onSetDemoBalance(n);
                setEditing(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AccountRow({
  account,
  active,
  subtitle,
  tone,
  onChoose,
  onEdit,
}: {
  account: Account;
  active: boolean;
  subtitle: string;
  tone: "sky" | "amber";
  onChoose: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className={`flex items-stretch ${active ? (tone === "sky" ? "bg-sky-400/[0.07]" : "bg-amber-400/[0.07]") : ""}`}>
      <button
        type="button"
        onClick={onChoose}
        aria-pressed={active}
        className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            active ? "border-white" : "border-slate-500"
          }`}
        >
          {active && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-[14px] font-medium text-white">
            {account.label}
            {active && (
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tone === "sky" ? "bg-sky-400/20 text-sky-300" : "bg-amber-400/20 text-amber-300"}`}>
                Active
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-[18px] font-semibold tabular-nums leading-tight text-white">
            {formatMoney(account.balance)}
          </span>
          <span className="mt-0.5 block text-[12px] text-slate-500">{subtitle}</span>
        </span>
      </button>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit demo balance"
          title="Edit demo balance"
          className="flex w-12 shrink-0 items-start justify-center pt-4 text-slate-400 transition-colors hover:text-white"
        >
          <PencilIcon size={16} />
        </button>
      )}
    </div>
  );
}

function DemoBalanceDialog({
  initial,
  onCancel,
  onApply,
}: {
  initial: number;
  onCancel: () => void;
  onApply: (n: number) => void;
}) {
  const [raw, setRaw] = useState(String(initial));
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const n = Number(raw.replace(/,/g, ""));
  const valid = raw.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= DEMO_MAX_BALANCE;
  const error =
    raw.trim() === "" ? null : !Number.isFinite(n) || n < 0 ? "Enter a valid amount." : n > DEMO_MAX_BALANCE ? `Maximum demo balance is ${formatMoney(DEMO_MAX_BALANCE)}.` : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        className="relative w-full max-w-[340px] rounded-xl border border-white/10 bg-ink-800 p-5 shadow-2xl"
      >
        <h2 id={`${id}-t`} className="text-[17px] font-semibold text-white">
          Demo balance
        </h2>
        <label htmlFor={`${id}-i`} className="mt-4 block text-[13px] text-slate-400">
          Virtual amount
        </label>
        <div
          className={`mt-1.5 flex h-11 items-center rounded-lg border bg-ink-950 px-3 focus-within:border-accent ${
            error ? "border-down/60" : "border-white/10"
          }`}
        >
          <span className="mr-2 text-slate-400" aria-hidden="true">$</span>
          <input
            id={`${id}-i`}
            ref={inputRef}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={raw}
            maxLength={12}
            onChange={(e) => setRaw(e.target.value.replace(/[^0-9.,]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && valid) onApply(Math.round(n * 100) / 100);
            }}
            aria-invalid={!!error}
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-semibold tabular-nums text-white outline-none"
          />
        </div>
        {error && (
          <p role="alert" className="mt-1.5 text-[12px] font-medium text-down">
            {error}
          </p>
        )}
        <p className="mt-3 text-[12px] leading-snug text-slate-500">Demo funds are virtual and cannot be withdrawn.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-md bg-ink-700 text-[14px] font-semibold text-white transition-colors hover:bg-ink-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => onApply(Math.round(n * 100) / 100)}
            className="h-10 rounded-md bg-brand text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
