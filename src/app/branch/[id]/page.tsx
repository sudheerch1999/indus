import { Suspense } from "react";
import { notFound } from "next/navigation";
import { branchById, leads, deliveries } from "@/lib/data";
import {
  getKPIs,
  getConversionFunnel,
  getBranchTargetAttainment,
  getRepScoreboard,
  getAgingLeads,
  getLeadsForBranch,
  getDeliveriesForBranch,
  getLostReasonBreakdown,
  getLeadSourceBreakdown,
  getModelMix,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import KpiCard from "@/components/KpiCard";
import ConversionFunnel from "@/components/ConversionFunnel";
import AgingLeadsPanel from "@/components/AgingLeadsPanel";
import RepLeaderboard from "@/components/RepLeaderboard";
import ForecastWidget from "@/components/ForecastWidget";
import LostReasonChart from "@/components/LostReasonChart";
import SourceBreakdownChart from "@/components/SourceBreakdownChart";
import ModelMixChart from "@/components/ModelMixChart";
import MonthPicker from "@/components/MonthPicker";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}

export async function generateStaticParams() {
  return ["B1", "B2", "B3", "B4", "B5"].map((id) => ({ id }));
}

export default async function BranchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { month: rawMonth } = await searchParams;
  const month = rawMonth ?? null;

  const branch = branchById[id];
  if (!branch) notFound();

  const filteredLeads = getLeadsForBranch(id, month);
  const filteredDeliveries = getDeliveriesForBranch(id, month);

  const kpi = getKPIs(filteredLeads, filteredDeliveries);
  const attainment = getBranchTargetAttainment(id, month);
  const funnel = getConversionFunnel(filteredLeads);
  const repScores = getRepScoreboard(id, month);
  const agingLeads = getAgingLeads(filteredLeads);
  const lostReasons = getLostReasonBreakdown(filteredLeads);
  const sources = getLeadSourceBreakdown(filteredLeads);
  const models = getModelMix(filteredLeads);

  const Icons = {
    Target: () => (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="8" cy="8" r="6.5"/><circle cx="8" cy="8" r="3.5"/><circle cx="8" cy="8" r="1"/>
      </svg>
    ),
    Conversion: () => (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12L7 6l3 3 4-5"/><path d="M10 4h3v3"/>
      </svg>
    ),
    Revenue: () => (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="8" cy="8" r="6.5"/>
        <path d="M8 4.5v1m0 5v1M6 7.5c0-.8.9-1.5 2-1.5s2 .7 2 1.5-1 1.5-2 1.5-2 .7-2 1.5S6.9 12 8 12s2-.7 2-1.5"/>
      </svg>
    ),
    Clock: () => (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 2.5"/>
      </svg>
    ),
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Breadcrumb + header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
            <a href="/" className="hover:text-blue-600 transition-colors">Network</a>
            <span>›</span>
            <span className="text-slate-600 font-medium">{branch.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{branch.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{branch.city} · {month ?? "Jun – Dec 2025"}</p>
        </div>
        <Suspense fallback={<div className="h-10 bg-slate-200 rounded-xl w-72 animate-pulse" />}>
          <MonthPicker />
        </Suspense>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <KpiCard
          title="Units vs Target"
          value={`${attainment.units.actual}/${attainment.units.target}`}
          sub={`${attainment.units.pct}% of monthly target`}
          icon={<Icons.Target />}
          fill={attainment.units.pct}
          accent={attainment.units.pct >= 90 ? "success" : attainment.units.pct >= 70 ? "warning" : "danger"}
        />
        <KpiCard
          title="Conversion Rate"
          value={`${kpi.conversionRate}%`}
          sub={`${kpi.delivered} won · ${kpi.lost} lost`}
          icon={<Icons.Conversion />}
          fill={kpi.conversionRate}
          accent={kpi.conversionRate >= 40 ? "success" : kpi.conversionRate >= 25 ? "warning" : "danger"}
        />
        <KpiCard
          title="Revenue Delivered"
          value={formatCurrency(attainment.revenue.actual)}
          sub={`${attainment.revenue.pct}% of ${formatCurrency(attainment.revenue.target)} target`}
          icon={<Icons.Revenue />}
          fill={attainment.revenue.pct}
          accent={attainment.revenue.pct >= 90 ? "success" : attainment.revenue.pct >= 70 ? "warning" : "danger"}
        />
        <KpiCard
          title="Avg Delivery Time"
          value={kpi.avgDeliveryDays !== null ? `${kpi.avgDeliveryDays}d` : "—"}
          sub={kpi.delayedDeliveries > 0 ? `${kpi.delayedDeliveries} with delays` : "No delays recorded"}
          icon={<Icons.Clock />}
          accent={kpi.delayedDeliveries > 3 ? "warning" : "default"}
        />
      </div>

      {/* Forecast widget */}
      <ForecastWidget branchId={id} month={month} />

      {/* Rep leaderboard */}
      <RepLeaderboard data={repScores} />

      {/* Middle row: funnel + source breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConversionFunnel data={funnel} title={`${branch.name} Funnel`} />
        <SourceBreakdownChart data={sources} />
      </div>

      {/* Bottom row: model mix + lost reasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModelMixChart data={models} />
        <LostReasonChart data={lostReasons} title="Why Leads Were Lost" />
      </div>

      {/* Aging leads */}
      <AgingLeadsPanel agingLeads={agingLeads} title={`Aging Leads — ${branch.name}`} />
    </div>
  );
}
