import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmt = {
  /** 1,234,567 */
  int: (n: number) =>
    new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n),
  /** 1,234.5 */
  dec: (n: number, digits = 1) =>
    new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n),
  /** £1,234,567 */
  gbp: (n: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(n),
  gbpShort: (n: number) => {
    if (Math.abs(n) >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `£${(n / 1_000).toFixed(0)}k`;
    return `£${n.toFixed(0)}`;
  },
  /** 1.2k, 3.4M */
  compact: (n: number) => {
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toFixed(0);
  },
  /** 12.3% */
  pct: (n: number, digits = 1) =>
    `${n.toFixed(digits)}%`,
  /** tCO2e */
  co2e: (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(2)} ktCO₂e`;
    return `${n.toFixed(1)} tCO₂e`;
  },
  date: (d: string | Date) =>
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(typeof d === "string" ? new Date(d) : d),
  month: (d: string | Date) =>
    new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "2-digit",
    }).format(typeof d === "string" ? new Date(d) : d),
};

/** Deterministic pseudo-random number generator for reproducible fixtures */
export function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}
