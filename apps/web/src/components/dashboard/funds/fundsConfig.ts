/**
 * QUOTIX Funds Configuration
 *
 * DEMO / UI PROTOTYPE ONLY.
 * No blockchain transaction detection, payment verification,
 * balance crediting, or real-money processing is implemented here.
 */

export const MIN_DEPOSIT_USD = 7;

export const MIN_TRADING_ACTIVITY_USD = 20;

export const TRADING_ACTIVITY_COMPLETED_USD = 0;

/* ================================================================
   DEMO PAYMENT ADDRESSES
   Replace these with clearly marked test addresses when testing.
   ================================================================ */

export const TRC20_DEPOSIT_ADDRESS =
  "TXEbqtPAxbFEUyo6roh7j8XhiRwLNcGT1V";

export const ERC20_DEPOSIT_ADDRESS =
  "ERC20_Not_Availaible";

export const BEP20_DEPOSIT_ADDRESS =
  "BEP20_Not_Availaible";

export const BTC_DEPOSIT_ADDRESS =
  "bc1qkzee4f9tc2pqsa740jkuq3t6gkx0vwgcwy732x";

export const ETH_DEPOSIT_ADDRESS =
  "ETH_Not_Availaible";

export const LTC_DEPOSIT_ADDRESS =
  "ltc1qsuv9j065maalldh45glnys47tjnqywtcgqnkyq";

/* ================================================================
   Payment methods
   ================================================================ */

export type FundsMethod = {
  id: string;
  name: string;
  network: string;
  symbol: string;
  badge: string;
  depositAvailable: boolean;
  depositAddress?: string;
};

export const FUNDS_METHODS: FundsMethod[] = [
  {
    id: "usdt-trc20",
    name: "USDT — TRC-20",
    network: "TRON (TRC-20)",
    symbol: "T",
    badge: "bg-emerald-600",
    depositAvailable: true,
    depositAddress: TRC20_DEPOSIT_ADDRESS,
  },

  {
    id: "usdt-erc20",
    name: "USDT — ERC-20",
    network: "Ethereum (ERC-20)",
    symbol: "T",
    badge: "bg-teal-600",
    depositAvailable: true,
    depositAddress: ERC20_DEPOSIT_ADDRESS,
  },

  {
    id: "usdt-bep20",
    name: "USDT — BEP-20",
    network: "BNB Smart Chain (BEP-20)",
    symbol: "T",
    badge: "bg-yellow-600",
    depositAvailable: true,
    depositAddress: BEP20_DEPOSIT_ADDRESS,
  },

  {
    id: "btc",
    name: "Bitcoin — BTC",
    network: "Bitcoin network",
    symbol: "₿",
    badge: "bg-orange-600",
    depositAvailable: true,
    depositAddress: BTC_DEPOSIT_ADDRESS,
  },

  {
    id: "eth",
    name: "Ethereum — ETH",
    network: "Ethereum network",
    symbol: "Ξ",
    badge: "bg-indigo-600",
    depositAvailable: true,
    depositAddress: ETH_DEPOSIT_ADDRESS,
  },

  {
    id: "ltc",
    name: "Litecoin — LTC",
    network: "Litecoin network",
    symbol: "Ł",
    badge: "bg-sky-600",
    depositAvailable: true,
    depositAddress: LTC_DEPOSIT_ADDRESS,
  },
];

export const TRC20_METHOD_ID = "usdt-trc20";

/* ================================================================
   Deposit limits
   ================================================================ */

export const DAILY_DEPOSIT_LIMIT_USD = 10000;

export const MAX_BONUS_DEPOSIT_USD = 5000;

export const BONUS_RATE = 0.25;

export const MAX_BONUS_USD = 1250;

export const DEPOSITED_TODAY_USD = 0;

/* ================================================================
   Helpers
   ================================================================ */

const round2 = (n: number) =>
  Math.round(n * 100) / 100;

export function calcBonus(
  amount: number | null
): number {
  if (
    amount === null ||
    !Number.isFinite(amount) ||
    amount < MIN_DEPOSIT_USD
  ) {
    return 0;
  }

  return Math.min(
    round2(amount * BONUS_RATE),
    MAX_BONUS_USD
  );
}

export type DepositCheck =
  | {
      ok: true;
      amount: number;
      bonus: number;
      total: number;
      capped: boolean;
    }
  | {
      ok: false;
      error: string | null;
    };

export function checkDeposit(
  amount: number | null
): DepositCheck {
  if (amount === null || amount === 0) {
    return {
      ok: false,
      error: null,
    };
  }

  if (amount < MIN_DEPOSIT_USD) {
    return {
      ok: false,
      error: `Minimum deposit is ${formatUsd(
        MIN_DEPOSIT_USD
      )}.`,
    };
  }

  const remaining = Math.max(
    0,
    DAILY_DEPOSIT_LIMIT_USD -
      DEPOSITED_TODAY_USD
  );

  if (
    amount > DAILY_DEPOSIT_LIMIT_USD ||
    amount > remaining
  ) {
    return {
      ok: false,
      error: `Maximum daily deposit limit is ${formatUsd(
        DAILY_DEPOSIT_LIMIT_USD
      )}.`,
    };
  }

  const bonus = calcBonus(amount);

  return {
    ok: true,
    amount,
    bonus,
    total: round2(amount + bonus),
    capped:
      amount > MAX_BONUS_DEPOSIT_USD,
  };
}

export function formatUsd2(
  n: number
): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseAmount(
  raw: string
): number | null {
  const cleaned = raw.replace(
    /[$,\s]/g,
    ""
  );

  if (
    cleaned === "" ||
    !/^\d*\.?\d*$/.test(cleaned)
  ) {
    return null;
  }

  const n = Number(cleaned);

  return Number.isFinite(n)
    ? n
    : null;
}

export function formatUsd(
  n: number
): string {
  const whole = Number.isInteger(n);

  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}