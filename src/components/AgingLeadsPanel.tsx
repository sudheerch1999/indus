"use client";

import type { AgingLead } from "@/lib/analytics";
import { repById } from "@/lib/data";
import { statusLabel, statusColor, cn } from "@/lib/utils";

interface Props {
  agingLeads: AgingLead[];
  title?: string;
}

function FlameIcon({ critical }: { critical: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 1C7 1 5 4 5 6C5 7.1 5.9 8 7 8C8.1 8 9 7.1 9 6C9 5 8 4 8 4C8 4 9 6 7.5 7C7.5 7 10 6 10 3.5C10 3.5 10.5 8 8.5 9.5C8.5 9.5 10 8.5 10 10.5C10 11.9 8.7 13 7 13C5.3 13 4 11.9 4 10.5C4 9 5.5 8 5.5 8C5.5 8 4 7.5 4 5.5C4 3.5 7 1 7 1Z"
        fill={critical ? "#EF4444" : "#F59E0B"}
      />
    </svg>
  );
}

export default function AgingLeadsPanel({ agingLeads, title = "Aging Leads" }: Props) {
  if (agingLeads.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle cx="10" cy="10" r="9" stroke="#16A34A" strokeWidth="1.5"/>
            <path d="M6 10l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title} — All Clear</p>
          <p className="text-xs text-slate-400 mt-0.5">No leads have been dormant for 7+ days in this period</p>
        </div>
      </div>
    );
  }

  const criticalCount = agingLeads.filter((a) => a.severity === "critical").length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <FlameIcon critical={criticalCount > 0} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Leads with no activity in 7+ days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot" />
              {criticalCount} critical
            </span>
          )}
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            {agingLeads.length} total
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/70">
              <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 text-left">Customer</th>
              <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 text-left hidden sm:table-cell">Model</th>
              <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 text-left">Stage</th>
              <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 text-right">Idle</th>
              <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 text-left hidden md:table-cell">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {agingLeads.slice(0, 15).map(({ lead, daysSinceActivity, severity }) => {
              const rep = repById[lead.assigned_to];
              const isCritical = severity === "critical";
              return (
                <tr
                  key={lead.id}
                  className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FlameIcon critical={isCritical} />
                      <span className="font-semibold text-slate-900 text-sm">{lead.customer_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-xs text-slate-500">{lead.model_interested}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", statusColor(lead.status))}>
                      {statusLabel(lead.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn(
                      "font-bold text-sm tabular-nums",
                      isCritical ? "text-red-600" : "text-amber-600"
                    )}>
                      {daysSinceActivity}d
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-500">{rep?.name ?? "—"}</span>
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
