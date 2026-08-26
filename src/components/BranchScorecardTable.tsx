"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { BranchScore } from "@/lib/analytics";
import { branchById } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  data: BranchScore[];
  month: string | null;
}

type SortKey = keyof BranchScore;

const BRANCH_DOTS: Record<string, string> = {
  B1: "bg-blue-500",
  B2: "bg-violet-500",
  B3: "bg-emerald-500",
  B4: "bg-amber-500",
  B5: "bg-pink-500",
};

function TargetBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? "bg-emerald-500" :
    pct >= 70 ? "bg-amber-400" :
    "bg-red-500";
  const badge =
    pct >= 90 ? "text-emerald-700 bg-emerald-50" :
    pct >= 70 ? "text-amber-700 bg-amber-50" :
    "text-red-700 bg-red-50";

  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
        <div
          className={cn("h-full rounded-full animate-bar-grow", color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap", badge)}>
        {pct}%
      </span>
    </div>
  );
}

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  return (
    <span className={cn("ml-1 text-xs", active ? "text-blue-500" : "text-slate-300")}>
      {active ? (asc ? "↑" : "↓") : "↕"}
    </span>
  );
}

export default function BranchScorecardTable({ data }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortKey, setSortKey] = useState<SortKey>("delivered");
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number ?? 0;
    const bv = b[sortKey] as number ?? 0;
    return sortAsc ? av - bv : bv - av;
  });

  function navigate(branchId: string) {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/branch/${branchId}?${params.toString()}`);
  }

  const headers: Array<{ key: SortKey; label: string; right?: boolean }> = [
    { key: "branchId",       label: "Branch" },
    { key: "totalLeads",     label: "Leads",      right: true },
    { key: "delivered",      label: "Delivered",  right: true },
    { key: "conversionRate", label: "Conv.",       right: true },
    { key: "targetPct",      label: "Target",      right: true },
    { key: "pipelineValue",  label: "Pipeline",   right: true },
    { key: "avgDeliveryDays",label: "Avg Del.",    right: true },
    { key: "agingLeadsCount",label: "Aging",       right: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Branch Scorecard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Click any row to drill into branch detail</p>
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">↕ sort by column</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/70">
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => handleSort(h.key)}
                  className={cn(
                    "px-4 py-2.5 text-xs font-semibold text-slate-500 cursor-pointer select-none whitespace-nowrap hover:text-slate-900 transition-colors",
                    h.right ? "text-right" : "text-left"
                  )}
                >
                  {h.label}
                  <SortIcon active={sortKey === h.key} asc={sortAsc} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const branch = branchById[row.branchId];
              return (
                <tr
                  key={row.branchId}
                  onClick={() => navigate(row.branchId)}
                  className="border-b border-slate-50 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors group"
                >
                  {/* Branch name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", BRANCH_DOTS[row.branchId])} />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors leading-tight">
                          {branch?.name}
                        </p>
                        <p className="text-xs text-slate-400">{branch?.city}</p>
                      </div>
                    </div>
                  </td>

                  {/* Leads */}
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-medium text-slate-700">{row.totalLeads}</span>
                  </td>

                  {/* Delivered */}
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-slate-900">{row.delivered}</span>
                  </td>

                  {/* Conversion */}
                  <td className="px-4 py-3.5 text-right">
                    <span className={cn(
                      "font-semibold text-sm",
                      row.conversionRate >= 40 ? "text-emerald-600" :
                      row.conversionRate >= 25 ? "text-amber-600" :
                      "text-red-600"
                    )}>
                      {row.conversionRate}%
                    </span>
                  </td>

                  {/* Target — inline bar */}
                  <td className="px-4 py-3.5">
                    <TargetBar pct={row.targetPct} />
                  </td>

                  {/* Pipeline */}
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-xs font-semibold text-slate-600">{formatCurrency(row.pipelineValue)}</span>
                  </td>

                  {/* Avg delivery */}
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-slate-600 text-sm">
                      {row.avgDeliveryDays !== null ? `${row.avgDeliveryDays}d` : "—"}
                    </span>
                  </td>

                  {/* Aging */}
                  <td className="px-4 py-3.5 text-right">
                    {row.agingLeadsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot" />
                        {row.agingLeadsCount}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
