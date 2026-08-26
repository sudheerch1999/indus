"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { RepScore } from "@/lib/analytics";
import { repById } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  data: RepScore[];
}

type SortKey = "totalLeads" | "delivered" | "conversionRate" | "pipelineValue" | "agingLeadsCount";

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

export default function RepLeaderboard({ data }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortKey, setSortKey] = useState<SortKey>("delivered");
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortAsc ? av - bv : bv - av;
  });

  function navigate(repId: string) {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/rep/${repId}?${params.toString()}`);
  }

  const headers: Array<{ key: SortKey; label: string }> = [
    { key: "totalLeads",      label: "Leads"    },
    { key: "delivered",       label: "Won"       },
    { key: "conversionRate",  label: "Conv."     },
    { key: "pipelineValue",   label: "Pipeline"  },
    { key: "agingLeadsCount", label: "Aging"     },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Rep Performance</h2>
          <p className="text-xs text-slate-400 mt-0.5">Click a rep to view their full pipeline</p>
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">↕ sort</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/70">
              <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 text-left w-8">#</th>
              <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 text-left">Rep</th>
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => handleSort(h.key)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 text-right cursor-pointer select-none whitespace-nowrap hover:text-slate-900 transition-colors"
                >
                  {h.label}
                  <span className={cn("ml-1 text-xs", sortKey === h.key ? "text-blue-500" : "text-slate-300")}>
                    {sortKey === h.key ? (sortAsc ? "↑" : "↓") : "↕"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const rep = repById[row.repId];
              const isManager = rep?.role === "branch_manager";
              const initials = rep?.name.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "?";

              return (
                <tr
                  key={row.repId}
                  onClick={() => navigate(row.repId)}
                  className={cn(
                    "border-b border-slate-50 last:border-0 cursor-pointer transition-colors group hover:bg-blue-50/40",
                    isManager ? "bg-blue-50/20" : ""
                  )}
                >
                  {/* Rank */}
                  <td className="px-5 py-3 w-8">
                    <span className="text-xs text-slate-400">
                      {MEDAL[i] ?? <span className="font-medium text-slate-400">{i + 1}</span>}
                    </span>
                  </td>

                  {/* Rep */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                        isManager ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                      )}>
                        {initials}
                      </div>
                      <div>
                        <p className={cn("font-semibold text-sm leading-tight group-hover:text-blue-700 transition-colors", isManager ? "text-blue-800" : "text-slate-900")}>
                          {rep?.name}
                        </p>
                        {isManager && (
                          <p className="text-xs text-blue-500 font-medium">Manager</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right text-slate-600 text-sm">{row.totalLeads}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{row.delivered}</td>

                  <td className="px-4 py-3 text-right">
                    <span className={cn("font-semibold text-sm",
                      row.conversionRate >= 40 ? "text-emerald-600" :
                      row.conversionRate >= 25 ? "text-amber-600" : "text-red-600"
                    )}>
                      {row.conversionRate}%
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-semibold text-slate-600">{formatCurrency(row.pipelineValue)}</span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {row.agingLeadsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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
