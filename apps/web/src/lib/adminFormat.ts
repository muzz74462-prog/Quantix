/** Pure formatting helpers (safe for both server and client components). All times are shown in UTC. */
export const fmtUtc = (iso: string): string => new Date(iso).toISOString().slice(0, 16).replace("T", " ") + " UTC";

export const fmtUtcSec = (iso: string): string => new Date(iso).toISOString().slice(0, 19).replace("T", " ") + " UTC";

export const fmtMoney = (n: number): string =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtSigned = (n: number): string => `${n < 0 ? "-" : "+"}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
