import type { Account } from "@/types/trading";
import { formatMoney } from "@/lib/demoTrading";

/** Compact label + balance, used inside the account switcher. */
export function AccountBalance({ account, align = "left" }: { account: Account; align?: "left" | "right" }) {
  return (
    <span className={`flex flex-col leading-tight ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${account.type === "demo" ? "text-amber-300" : "text-sky-300"}`}>
        {account.label}
      </span>
      <span className="text-[14px] font-bold text-white">{formatMoney(account.balance)}</span>
    </span>
  );
}
