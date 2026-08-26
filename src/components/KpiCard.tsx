"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accent?: "default" | "success" | "warning" | "danger";
  /** 0-100 optional fill bar */
  fill?: number;
}

const accentMap = {
  default: {
    border: "border-slate-200",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    bar: "bg-blue-500",
  },
  success: {
    border: "border-emerald-200",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    bar: "bg-emerald-500",
  },
  warning: {
    border: "border-amber-200",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    bar: "bg-amber-500",
  },
  danger: {
    border: "border-red-200",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    bar: "bg-red-500",
  },
};

export default function KpiCard({ title, value, sub, icon, accent = "default", fill }: Props) {
  const a = accentMap[accent];
  return (
    <div className={cn(
      "relative bg-white rounded-2xl border p-5 shadow-sm overflow-hidden animate-fade-up",
      a.border
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", a.iconBg)}>
          <span className={cn("w-4 h-4", a.iconColor)}>{icon}</span>
        </div>
        {fill !== undefined && (
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full mt-0.5",
            accent === "success" ? "bg-emerald-100 text-emerald-700" :
            accent === "warning" ? "bg-amber-100 text-amber-700" :
            accent === "danger" ? "bg-red-100 text-red-700" :
            "bg-slate-100 text-slate-600"
          )}>
            {fill}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{value}</p>
        {sub && <p className="mt-1.5 text-xs text-slate-500 leading-snug">{sub}</p>}
      </div>

      {/* Optional fill bar */}
      {fill !== undefined && (
        <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full animate-bar-grow", a.bar)}
            style={{ width: `${Math.min(fill, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
