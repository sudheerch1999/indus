"use client";

import { useState } from "react";
import type { Lead } from "@/types";
import type { AgingLead, KPISummary } from "@/lib/analytics";
import { formatCurrency, statusLabel, statusColor, cn, DATA_REFERENCE_DATE } from "@/lib/utils";
import LeadTimeline from "@/components/LeadTimeline";
import KpiCard from "@/components/KpiCard";

interface Props {
  repName: string;
  repRole: string;
  branchName: string;
  branchCity: string;
  branchId: string;
  leads: Lead[];
  kpi: KPISummary;
  agingCount: number;
  month: string | null;
}

function daysSinceLastActivity(lead: Lead): number {
  const last = lead.last_activity_at || lead.created_at;
  return Math.max(0, Math.floor(
    (DATA_REFERENCE_DATE.getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24)
  ));
}

function daysInCurrentStage(lead: Lead): number {
  const history = lead.status_history;
  if (!history.length) return 0;
  const lastEntry = history[history.length - 1];
  return Math.max(0, Math.floor(
    (DATA_REFERENCE_DATE.getTime() - new Date(lastEntry.timestamp).getTime()) / (1000 * 60 * 60 * 24)
  ));
}

export default function RepDetailClient({
  repName, repRole, branchName, branchCity, branchId, leads, kpi, agingCount, month
}: Props) {
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const branchHref = `/branch/${branchId}${month ? `?month=${month}` : ""}`;
  const initials = repName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const sortedLeads = [...leads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
          <a href="/" className="hover:text-blue-600 transition-colors">Network</a>
          <span>›</span>
          <a href={branchHref} className="hover:text-blue-600 transition-colors">{branchName}</a>
          <span>›</span>
          <span className="text-slate-700 font-medium">{repName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 font-bold">{initials}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{repName}</h1>
            <p className="text-sm text-slate-500">
              {repRole === "branch_manager" ? "Branch Manager" : "Sales Officer"} · {branchName} · {branchCity}
            </p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <KpiCard
          title="Total Leads"
          value={kpi.totalLeads}
          sub={`${kpi.inPipeline} in active pipeline`}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4"/></svg>}
        />
        <KpiCard
          title="Delivered"
          value={kpi.delivered}
          sub={`${kpi.conversionRate}% conversion`}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12L7 6l3 3 4-5"/><path d="M10 4h3v3"/></svg>}
          fill={kpi.conversionRate}
          accent={kpi.conversionRate >= 40 ? "success" : kpi.conversionRate >= 25 ? "warning" : "danger"}
        />
        <KpiCard
          title="Pipeline Value"
          value={formatCurrency(kpi.pipelineValue)}
          sub={`${kpi.inPipeline} open leads`}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v1m0 5v1M6 7.5c0-.8.9-1.5 2-1.5s2 .7 2 1.5-1 1.5-2 1.5-2 .7-2 1.5S6.9 12 8 12s2-.7 2-1.5"/></svg>}
        />
        <KpiCard
          title="Aging Leads"
          value={agingCount}
          sub={agingCount > 0 ? "Need follow-up" : "All leads active"}
          icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 2.5"/></svg>}
          accent={agingCount > 2 ? "warning" : "default"}
        />
      </div>

      {/* Lead list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">All Leads</h2>
          <p className="text-xs text-slate-400 mt-0.5">Click a lead to view full activity timeline</p>
        </div>
        {sortedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-slate-400">No leads found for this period</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sortedLeads.map((lead) => {
              const daysIdle = daysSinceLastActivity(lead);
              const daysInStage = daysInCurrentStage(lead);
              const isExpanded = expandedLead === lead.id;
              const isOpen = !["delivered", "lost"].includes(lead.status);
              const agingFlag = isOpen && daysIdle >= 10 ? "critical" : isOpen && daysIdle >= 5 ? "warning" : null;

              return (
                <div key={lead.id}>
                  <div
                    className="px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                          agingFlag === "critical" ? "bg-red-500" : agingFlag === "warning" ? "bg-amber-400" : "bg-slate-200"
                        )} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{lead.customer_name}</p>
                          <p className="text-xs text-slate-500 truncate">{lead.model_interested} · {formatCurrency(lead.deal_value)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColor(lead.status))}>
                          {statusLabel(lead.status)}
                        </span>
                        {isOpen && <span className="text-xs text-slate-400">{daysInStage}d in stage</span>}
                        <span className="text-slate-300 text-xs">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {lead.lost_reason && (
                      <p className="text-xs text-red-600 mt-1 ml-5">Lost: {lead.lost_reason}</p>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide pt-4 mb-3">Activity Timeline</p>
                      <LeadTimeline lead={lead} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
