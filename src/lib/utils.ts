import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  }
  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1, 1);
  return date.toLocaleString("en-IN", { month: "short", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function daysSince(iso: string, referenceDate: Date): number {
  const then = new Date(iso);
  const diff = referenceDate.getTime() - then.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    test_drive: "Test Drive",
    negotiation: "Negotiation",
    order_placed: "Order Placed",
    delivered: "Delivered",
    lost: "Lost",
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    new: "bg-slate-100 text-slate-700",
    contacted: "bg-blue-100 text-blue-700",
    test_drive: "bg-violet-100 text-violet-700",
    negotiation: "bg-amber-100 text-amber-700",
    order_placed: "bg-emerald-100 text-emerald-700",
    delivered: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

export const MONTHS = [
  "2025-06",
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
];

// Reference date for aging calculations — end of data period
export const DATA_REFERENCE_DATE = new Date("2025-12-31T23:59:59Z");

export const BRANCH_COLORS: Record<string, string> = {
  B1: "#2563EB",
  B2: "#7C3AED",
  B3: "#059669",
  B4: "#D97706",
  B5: "#DB2777",
};

export const FUNNEL_STAGES: Array<{ key: string; label: string }> = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "test_drive", label: "Test Drive" },
  { key: "negotiation", label: "Negotiation" },
  { key: "order_placed", label: "Order Placed" },
  { key: "delivered", label: "Delivered" },
];
