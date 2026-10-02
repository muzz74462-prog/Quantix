"use client";

import { useEffect, useState } from "react";
import { BonusSummary, DepositBonusInfo } from "./DepositBonus";
import { DepositMethodCard } from "./DepositMethodCard";
import { CryptoAddress } from "./CryptoAddress";
import {
  DAILY_DEPOSIT_LIMIT_USD,
  FUNDS_METHODS,
  MAX_BONUS_DEPOSIT_USD,
  MIN_DEPOSIT_USD,
  checkDeposit,
  formatUsd,
  parseAmount,
} from "./fundsConfig";
import {
  FundsCard,
  FundsLayout,
  SectionLabel,
} from "./FundsLayout";

export function DepositPage() {
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [rawAmount, setRawAmount] =
    useState("50");

  const [touched, setTouched] =
    useState(false);

  // Demo payment-window timer: 30 minutes.
  const [timeLeft, setTimeLeft] =
    useState(30 * 60);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeLeft % 60)
    .toString()
    .padStart(2, "0");

  const timerProgress =
    (timeLeft / (30 * 60)) * 100;

  const selectedMethod =
    FUNDS_METHODS.find(
      (method) =>
        method.id === selectedId
    );

  const amount = parseAmount(rawAmount);
  const check = checkDeposit(amount);

  const errorText = !check.ok
    ? check.error ??
      (touched
        ? `Minimum deposit is ${formatUsd(
            MIN_DEPOSIT_USD
          )}.`
        : null)
    : null;

  const showError =
    errorText !== null;

  return (
    <FundsLayout
      active="deposit"
      title="Deposit funds"
      subtitle="Choose a payment method and enter your deposit amount."
    >
      {/* Limits */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Daily limit",
            value: formatUsd(
              DAILY_DEPOSIT_LIMIT_USD
            ),
          },
          {
            label: "Minimum deposit",
            value: formatUsd(
              MIN_DEPOSIT_USD
            ),
          },
          {
            label:
              "Maximum bonus-eligible deposit",
            value: formatUsd(
              MAX_BONUS_DEPOSIT_USD
            ),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="min-w-0 rounded-xl border border-white/[0.08] bg-ink-800 px-4 py-3"
          >
            <p className="text-[13px] leading-tight text-slate-400">
              {item.label}
            </p>

            <p className="mt-1 text-[20px] font-semibold tabular-nums leading-tight text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 space-y-5">

          {/* Payment methods */}
          <section aria-labelledby="deposit-methods">
            <p
              id="deposit-methods"
              className="sr-only"
            >
              Payment methods
            </p>

            <SectionLabel>
              Payment methods
            </SectionLabel>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FUNDS_METHODS.map(
                (method) => (
                  <DepositMethodCard
                    key={method.id}
                    method={method}
                    available={
                      method.depositAvailable
                    }
                    selected={
                      selectedId ===
                      method.id
                    }
                    onSelect={() =>
                      setSelectedId(
                        method.id
                      )
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* Selected method */}
          {selectedMethod &&
          selectedMethod.depositAvailable ? (
            <FundsCard className="space-y-5">

              <h2 className="text-[17px] font-semibold text-white">
                Deposit{" "}
                {selectedMethod.name}
              </h2>

              {/* Demo payment notice */}
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                <p className="text-[13px] font-semibold text-white">
                  Warning
                </p>

                <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
                 Send exactly to this network otherwise you loss everything
                </p>
              </div>

              {/* Network */}
              <div>
                <p className="text-[13px] font-medium text-slate-400">
                  Coin
                </p>

                <p className="mt-1 text-[15px] font-semibold text-white">
                  {selectedMethod.network}
                </p>
              </div>
{selectedMethod.depositAddress && (
  <CryptoAddress
    network={selectedMethod.network}
    address={selectedMethod.depositAddress}
  />
)}

              <p className="text-[13px] font-medium text-slate-300">
                Minimum amount:{" "}
                {formatUsd(MIN_DEPOSIT_USD)}
              </p>

              {/* Warning */}
              <div
                role="note"
                className="flex gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3.5"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 2.2 1.6 16.8a1 1 0 0 0 .9 1.5h15a1 1 0 0 0 .9-1.5L10 2.2Zm-.9 5.6h1.8v5H9.1v-5Zm0 6.4h1.8V16H9.1v-1.8Z" />
                </svg>

                <p className="min-w-0 text-[15px] font-medium leading-snug text-slate-100">
                  AFter Confirmation the Deposit Automatically proceed to your account
                </p>
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-baseline justify-between gap-3">

                  <label
                    htmlFor="deposit-amount"
                    className="text-[14px] font-medium text-white"
                  >
                    Deposit amount
                  </label>

                  <span className="text-[12px] text-slate-500">
                    Daily limit:{" "}
                    {formatUsd(
                      DAILY_DEPOSIT_LIMIT_USD
                    )}
                  </span>
                </div>

                <div
                  className={`mt-2 flex h-12 items-center rounded-lg border bg-ink-950 px-3.5 transition-colors focus-within:border-accent ${
                    showError
                      ? "border-down/60"
                      : "border-white/10"
                  }`}
                >
                  <span className="mr-2 text-[16px] text-slate-400">
                    $
                  </span>

                  <input
                    id="deposit-amount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    maxLength={12}
                    value={rawAmount}
                    onChange={(event) =>
                      setRawAmount(
                        event.target.value.replace(
                          /[^0-9.,]/g,
                          ""
                        )
                      )
                    }
                    onBlur={() =>
                      setTouched(true)
                    }
                    aria-invalid={
                      showError
                    }
                    aria-describedby="deposit-amount-hint"
                    className="h-full min-w-0 flex-1 bg-transparent text-[17px] font-semibold tabular-nums text-white outline-none placeholder:text-slate-600"
                  />

                  <span className="ml-2 text-[12px] font-medium text-slate-500">
                    USD
                  </span>
                </div>

                {showError ? (
                  <p
                    id="deposit-amount-hint"
                    role="alert"
                    className="mt-2 text-[13px] font-medium text-down"
                  >
                    {errorText}
                  </p>
                ) : (
                  <p
                    id="deposit-amount-hint"
                    className="mt-2 text-[12px] text-slate-500"
                  >
                    Minimum{" "}
                    {formatUsd(
                      MIN_DEPOSIT_USD
                    )}{" "}
                    · bonus applies up to{" "}
                    {formatUsd(
                      MAX_BONUS_DEPOSIT_USD
                    )}
                  </p>
                )}
              </div>

              <BonusSummary
                check={check}
              />

              {/* 30 minute demo timer */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      Payment window
                    </p>

                    <p className="mt-1 text-[12px] text-slate-500">
                      Complete the payment within
                      this time.
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-ink-950 px-3 py-2">
                    <span className="font-mono text-[18px] font-bold tabular-nums text-white">
                      {minutes}:{seconds}
                    </span>
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-1000"
                    style={{
                      width: `${timerProgress}%`,
                    }}
                  />
                </div>

                {timeLeft > 0 ? (
                  <p className="mt-3 text-center text-[12px] text-slate-500">
                    KYC verification will be
                    available after the simulated
                    payment step.
                  </p>
                ) : (
                  <p className="mt-3 text-center text-[12px] font-medium text-amber-300">
                    Payment window expired.
                  </p>
                )}
              </div>

              <p className="text-[12px] leading-snug text-slate-500">
                Live mode: payment verification and
                account balance updates are
                connected.
              </p>

            </FundsCard>
          ) : (
            <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-[13px] text-slate-400">
              Select an available payment method
              to view its details.
            </p>
          )}
        </div>

        <DepositBonusInfo />
      </div>
    </FundsLayout>
  );
}