import { Suspense } from "react";
import { leads, deliveries } from "@/lib/data";
import {
  getKPIs,
  getConversionFunnel,
  getMonthlyTrend,
  getBranchScoreboard,
  getAgingLeads,
  getAlerts,
  getOverallTargetAttainment,
  getLostReasonBreakdown,
  getInsights,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import KpiCard from "@/components/KpiCard";
import AlertBar from "@/components/AlertBar";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import BranchScorecardTable from "@/components/BranchScorecardTable";
import ConversionFunnel from "@/components/ConversionFunnel";
import AgingLeadsPanel from "@/components/AgingLeadsPanel";
import ForecastWidget from "@/components/ForecastWidget";
import LostReasonChart from "@/components/LostReasonChart";
import MonthPicker from "@/components/MonthPicker";
import InsightSummary from "@/components/InsightSummary";

// ── Inline SVG icons (keeps bundle tiny, no extra imports) ───────────────────
const Icons = {
  Leads: () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4"/>
      <path d="M12 3c1.1.4 2 1.5 2 3s-.9 2.6-2 3"/>
    </svg>
  ),
  Conversion: () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12L7 6l3 3 4-5"/>
      <path d="M10 4h3v3"/>
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

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function OverviewPage({ searchParams }: PageProps) {
  const { month: rawMonth } = await searchParams;
  const month = rawMonth ?? null;

  const filteredLeads = leads.filter((l) => !month || l.created_at.startsWith(month));
  const filteredDeliveries = deliveries.filter((d) => !month || d.delivery_date?.startsWith(month));

  const kpi        = getKPIs(filteredLeads, filteredDeliveries);
  const attainment = getOverallTargetAttainment(month);
  const funnel     = getConversionFunnel(filteredLeads);
  const trend      = getMonthlyTrend(null);
  const scoreboard = getBranchScoreboard(month);
  const agingLeads = getAgingLeads(filteredLeads);
  const alerts     = getAlerts(month);
  const lostReasons = getLostReasonBreakdown(filteredLeads);
  const insights    = getInsights(month);

  const monthLabel = month
    ? new Date(month + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })
    : "Jun – Dec 2025";

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Network Overview</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Toyota Dealer Network</h1>
          <p className="text-sm text-slate-500 mt-0.5">{monthLabel}</p>
        </div>
        <Suspense fallback={<div className="h-10 bg-slate-200 rounded-xl w-72 animate-pulse" />}>
          <MonthPicker />
        </Suspense>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      <AlertBar alerts={alerts} />

      {/* ── Insight narrative ───────────────────────────────────────────── */}
      <InsightSummary insights={insights} month={month} />

      {/* ── KPI strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <KpiCard
          title="Total Leads"
          value={kpi.totalLeads}
          sub={`${kpi.inPipeline} in active pipeline`}
          icon={<Icons.Leads />}
          accent="default"
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
          value={formatCurrency(kpi.totalRevenue)}
          sub={`${attainment.revenue.pct}% of ${formatCurrency(attainment.revenue.target)} target`}
          icon={<Icons.Revenue />}
          fill={attainment.revenue.pct}
          accent={attainment.revenue.pct >= 90 ? "success" : attainment.revenue.pct >= 70 ? "warning" : "danger"}
        />
        <KpiCard
          title="Avg Delivery Time"
          value={kpi.avgDeliveryDays !== null ? `${kpi.avgDeliveryDays}d` : "—"}
          sub={kpi.delayedDeliveries > 0 ? `${kpi.delayedDeliveries} delayed deliveries` : "No delays recorded"}
          icon={<Icons.Clock />}
          accent={kpi.delayedDeliveries > 5 ? "warning" : "default"}
        />
      </div>

      {/* ── Trend chart ─────────────────────────────────────────────────── */}
      <MonthlyTrendChart data={trend} />

      {/* ── Branch scorecard ────────────────────────────────────────────── */}
      <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />}>
        <BranchScorecardTable data={scoreboard} month={month} />
      </Suspense>

      {/* ── Analytics row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ConversionFunnel data={funnel} />
        <ForecastWidget branchId={null} month={month} />
        <LostReasonChart data={lostReasons} />
      </div>

      {/* ── Aging leads ─────────────────────────────────────────────────── */}
      <AgingLeadsPanel agingLeads={agingLeads} />

    </div>
  );
}
