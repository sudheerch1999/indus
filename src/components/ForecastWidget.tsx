"use client";

import { getMonthlyTrend } from "@/lib/analytics";
import { formatCurrency, cn } from "@/lib/utils";

interface Props {
  branchId: string | null;
  month: string | null;
}

export default function ForecastWidget({ branchId, month }: Props) {
  const trend = getMonthlyTrend(branchId);
  const rows = month ? trend.filter((t) => t.month === month) : trend;

  if (rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-900">Target vs Actual</h2>
      <p className="text-xs text-slate-400 mt-0.5 mb-5">Units delivered against monthly targets</p>

      <div className="space-y-4">
        {rows.map((row) => {
          const pct = row.target_units > 0 ? Math.min(100, Math.round((row.delivered / row.target_units) * 100)) : 0;
          const isGood = pct >= 90;
          const isBad  = pct < 70;

          const barColor = isGood ? "bg-emerald-500" : isBad ? "bg-red-500" : "bg-amber-400";
          const labelColor = isGood ? "text-emerald-700" : isBad ? "text-red-700" : "text-amber-700";
          const badgeColor = isGood ? "bg-emerald-100 text-emerald-700" : isBad ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";

          return (
            <div key={row.month}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 w-7">{row.label}</span>
                  <span className={cn("text-xs font-bold", labelColor)}>
                    {row.delivered} / {row.target_units}
                  </span>
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", badgeColor)}>{pct}%</span>
              </div>

              {/* Track bar */}
              <div className="relative h-5 bg-slate-100 rounded-lg overflow-hidden">
                {/* Target marker line */}
                <div className="absolute inset-y-0 w-px bg-slate-300 right-0 z-10" />
                {/* Actual fill */}
                <div
                  className={cn("h-full rounded-lg animate-bar-grow", barColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{formatCurrency(row.revenue)}</span>
                <span>target {formatCurrency(row.target_revenue)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
