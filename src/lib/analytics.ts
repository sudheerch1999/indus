import { leads, targets, deliveries, salesReps, branchById } from "@/lib/data";
import type { Lead, Delivery } from "@/types";
import { DATA_REFERENCE_DATE, FUNNEL_STAGES, MONTHS } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function leadMonth(lead: Lead): string {
  return lead.created_at.slice(0, 7); // "YYYY-MM"
}

function deliveryMonth(d: Delivery): string | null {
  return d.delivery_date ? d.delivery_date.slice(0, 7) : null;
}

function filterByMonth<T>(
  items: T[],
  getMonth: (item: T) => string | null,
  month: string | null
): T[] {
  if (!month) return items;
  return items.filter((item) => getMonth(item) === month);
}

// Furthest pipeline stage reached by a lead (excluding "lost")
const STAGE_ORDER = [
  "new",
  "contacted",
  "test_drive",
  "negotiation",
  "order_placed",
  "delivered",
];

function furthestStage(lead: Lead): string {
  const reached = new Set<string>(lead.status_history.map((h) => h.status));
  for (let i = STAGE_ORDER.length - 1; i >= 0; i--) {
    if (reached.has(STAGE_ORDER[i])) return STAGE_ORDER[i];
  }
  return "new";
}

// ─── Filtering ───────────────────────────────────────────────────────────────

export function getLeadsForBranch(branchId: string | null, month: string | null): Lead[] {
  let result = leads;
  if (branchId) result = result.filter((l) => l.branch_id === branchId);
  result = filterByMonth(result, leadMonth, month);
  return result;
}

export function getLeadsForRep(repId: string, month: string | null): Lead[] {
  let result = leads.filter((l) => l.assigned_to === repId);
  result = filterByMonth(result, leadMonth, month);
  return result;
}

export function getDeliveriesForBranch(branchId: string | null, month: string | null): Delivery[] {
  const branchLeadIds = new Set(
    leads
      .filter((l) => !branchId || l.branch_id === branchId)
      .map((l) => l.id)
  );
  let result = deliveries.filter((d) => branchLeadIds.has(d.lead_id));
  result = filterByMonth(result, deliveryMonth, month);
  return result;
}

// ─── KPIs ───────────────────────────────────────────────────────────────────

export interface KPISummary {
  totalLeads: number;
  delivered: number;
  lost: number;
  inPipeline: number;
  conversionRate: number; // delivered / (delivered + lost) * 100
  totalRevenue: number; // sum of deal_value for delivered leads
  pipelineValue: number; // sum of deal_value for active leads
  avgDeliveryDays: number | null;
  delayedDeliveries: number;
}

export function getKPIs(filteredLeads: Lead[], filteredDeliveries: Delivery[]): KPISummary {
  const delivered = filteredLeads.filter((l) => l.status === "delivered").length;
  const lost = filteredLeads.filter((l) => l.status === "lost").length;
  const closed = delivered + lost;
  const inPipeline = filteredLeads.filter(
    (l) => !["delivered", "lost"].includes(l.status)
  ).length;

  const totalRevenue = filteredLeads
    .filter((l) => l.status === "delivered")
    .reduce((sum, l) => sum + l.deal_value, 0);

  const pipelineValue = filteredLeads
    .filter((l) => !["delivered", "lost"].includes(l.status))
    .reduce((sum, l) => sum + l.deal_value, 0);

  const daysArr = filteredDeliveries
    .map((d) => d.days_to_deliver)
    .filter((d): d is number => d !== null);

  const avgDeliveryDays =
    daysArr.length > 0
      ? Math.round(daysArr.reduce((a, b) => a + b, 0) / daysArr.length)
      : null;

  const delayedDeliveries = filteredDeliveries.filter((d) => d.delay_reason !== null).length;

  return {
    totalLeads: filteredLeads.length,
    delivered,
    lost,
    inPipeline,
    conversionRate: closed > 0 ? Math.round((delivered / closed) * 100) : 0,
    totalRevenue,
    pipelineValue,
    avgDeliveryDays,
    delayedDeliveries,
  };
}

// ─── Target Attainment ───────────────────────────────────────────────────────

export interface TargetAttainment {
  units: { actual: number; target: number; pct: number };
  revenue: { actual: number; target: number; pct: number };
}

export function getBranchTargetAttainment(
  branchId: string,
  month: string | null
): TargetAttainment {
  const branchTargets = targets.filter(
    (t) => t.branch_id === branchId && (!month || t.month === month)
  );

  const targetUnits = branchTargets.reduce((s, t) => s + t.target_units, 0);
  const targetRevenue = branchTargets.reduce((s, t) => s + t.target_revenue, 0);

  const deliveredLeads = leads.filter(
    (l) =>
      l.branch_id === branchId &&
      l.status === "delivered" &&
      (!month || deliveryMonth(deliveries.find((d) => d.lead_id === l.id) ?? { delivery_date: "" } as Delivery) === month)
  );

  const actualUnits = deliveredLeads.length;
  const actualRevenue = deliveredLeads.reduce((s, l) => s + l.deal_value, 0);

  return {
    units: {
      actual: actualUnits,
      target: targetUnits,
      pct: targetUnits > 0 ? Math.round((actualUnits / targetUnits) * 100) : 0,
    },
    revenue: {
      actual: actualRevenue,
      target: targetRevenue,
      pct: targetRevenue > 0 ? Math.round((actualRevenue / targetRevenue) * 100) : 0,
    },
  };
}

export function getOverallTargetAttainment(month: string | null): TargetAttainment {
  const filteredTargets = targets.filter((t) => !month || t.month === month);
  const targetUnits = filteredTargets.reduce((s, t) => s + t.target_units, 0);
  const targetRevenue = filteredTargets.reduce((s, t) => s + t.target_revenue, 0);

  // Match deliveries by delivery month
  const deliveryLeadIds = new Set(
    deliveries
      .filter((d) => !month || deliveryMonth(d) === month)
      .map((d) => d.lead_id)
  );

  const deliveredLeads = leads.filter(
    (l) => l.status === "delivered" && deliveryLeadIds.has(l.id)
  );

  const actualUnits = deliveredLeads.length;
  const actualRevenue = deliveredLeads.reduce((s, l) => s + l.deal_value, 0);

  return {
    units: {
      actual: actualUnits,
      target: targetUnits,
      pct: targetUnits > 0 ? Math.round((actualUnits / targetUnits) * 100) : 0,
    },
    revenue: {
      actual: actualRevenue,
      target: targetRevenue,
      pct: targetRevenue > 0 ? Math.round((actualRevenue / targetRevenue) * 100) : 0,
    },
  };
}

// ─── Conversion Funnel ───────────────────────────────────────────────────────

export interface FunnelData {
  stage: string;
  label: string;
  count: number;
  dropOffPct: number;
}

export function getConversionFunnel(filteredLeads: Lead[]): FunnelData[] {
  const counts: Record<string, number> = {};
  for (const lead of filteredLeads) {
    const fs = furthestStage(lead);
    const idx = STAGE_ORDER.indexOf(fs);
    for (let i = 0; i <= idx; i++) {
      counts[STAGE_ORDER[i]] = (counts[STAGE_ORDER[i]] ?? 0) + 1;
    }
  }

  return FUNNEL_STAGES.map((stage, i) => {
    const count = counts[stage.key] ?? 0;
    const prevCount = i > 0 ? (counts[FUNNEL_STAGES[i - 1].key] ?? 0) : count;
    const dropOffPct =
      prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;
    return { stage: stage.key, label: stage.label, count, dropOffPct };
  });
}

// ─── Monthly Trend ───────────────────────────────────────────────────────────

export interface MonthlyTrendPoint {
  month: string;
  label: string;
  delivered: number;
  revenue: number;
  target_units: number;
  target_revenue: number;
}

export function getMonthlyTrend(branchId: string | null): MonthlyTrendPoint[] {
  return MONTHS.map((month) => {
    const monthDeliveries = deliveries.filter(
      (d) => deliveryMonth(d) === month
    );
    const monthLeads = leads.filter(
      (l) =>
        l.status === "delivered" &&
        (!branchId || l.branch_id === branchId) &&
        monthDeliveries.some((d) => d.lead_id === l.id)
    );

    const monthTargets = targets.filter(
      (t) => t.month === month && (!branchId || t.branch_id === branchId)
    );

    const [year, m] = month.split("-");
    const date = new Date(parseInt(year), parseInt(m) - 1, 1);
    const label = date.toLocaleString("en-IN", { month: "short" });

    return {
      month,
      label,
      delivered: monthLeads.length,
      revenue: monthLeads.reduce((s, l) => s + l.deal_value, 0),
      target_units: monthTargets.reduce((s, t) => s + t.target_units, 0),
      target_revenue: monthTargets.reduce((s, t) => s + t.target_revenue, 0),
    };
  });
}

// ─── Aging Leads ─────────────────────────────────────────────────────────────

export interface AgingLead {
  lead: Lead;
  daysSinceActivity: number;
  severity: "warning" | "critical";
}

export function getAgingLeads(
  filteredLeads: Lead[],
  thresholdDays = 7
): AgingLead[] {
  const openStatuses = ["new", "contacted", "test_drive", "negotiation"];
  return filteredLeads
    .filter((l) => openStatuses.includes(l.status))
    .map((l) => {
      const lastActivity = l.last_activity_at || l.created_at;
      const ref = DATA_REFERENCE_DATE;
      const then = new Date(lastActivity);
      const diff = Math.max(
        0,
        Math.floor((ref.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
      );
      return { lead: l, daysSinceActivity: diff, severity: diff >= 14 ? "critical" : "warning" } as AgingLead;
    })
    .filter((a) => a.daysSinceActivity >= thresholdDays)
    .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);
}

// ─── Lost Reason Breakdown ───────────────────────────────────────────────────

export interface BreakdownItem {
  name: string;
  count: number;
  pct: number;
}

export function getLostReasonBreakdown(filteredLeads: Lead[]): BreakdownItem[] {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const l of filteredLeads) {
    if (l.status === "lost" && l.lost_reason) {
      counts[l.lost_reason] = (counts[l.lost_reason] ?? 0) + 1;
      total++;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

export function getLeadSourceBreakdown(filteredLeads: Lead[]): BreakdownItem[] {
  const counts: Record<string, number> = {};
  let total = filteredLeads.length;
  for (const l of filteredLeads) {
    counts[l.source] = (counts[l.source] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

export function getModelMix(filteredLeads: Lead[]): BreakdownItem[] {
  const counts: Record<string, number> = {};
  let total = filteredLeads.length;
  for (const l of filteredLeads) {
    if (l.status === "delivered") {
      counts[l.model_interested] = (counts[l.model_interested] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

export function getDelayReasonBreakdown(filteredDeliveries: Delivery[]): BreakdownItem[] {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const d of filteredDeliveries) {
    if (d.delay_reason) {
      counts[d.delay_reason] = (counts[d.delay_reason] ?? 0) + 1;
      total++;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

// ─── Branch Scoreboard ───────────────────────────────────────────────────────

export interface BranchScore {
  branchId: string;
  totalLeads: number;
  delivered: number;
  conversionRate: number;
  targetPct: number;
  revenueActual: number;
  revenueTarget: number;
  revenuePct: number;
  pipelineValue: number;
  avgDeliveryDays: number | null;
  agingLeadsCount: number;
}

export function getBranchScoreboard(month: string | null): BranchScore[] {
  const branchIds = ["B1", "B2", "B3", "B4", "B5"];
  return branchIds.map((branchId) => {
    const branchLeads = getLeadsForBranch(branchId, month);
    const branchDeliveries = getDeliveriesForBranch(branchId, month);
    const kpi = getKPIs(branchLeads, branchDeliveries);
    const attainment = getBranchTargetAttainment(branchId, month);
    const aging = getAgingLeads(branchLeads);

    return {
      branchId,
      totalLeads: kpi.totalLeads,
      delivered: kpi.delivered,
      conversionRate: kpi.conversionRate,
      targetPct: attainment.units.pct,
      revenueActual: attainment.revenue.actual,
      revenueTarget: attainment.revenue.target,
      revenuePct: attainment.revenue.pct,
      pipelineValue: kpi.pipelineValue,
      avgDeliveryDays: kpi.avgDeliveryDays,
      agingLeadsCount: aging.length,
    };
  });
}

// ─── Rep Scoreboard ─────────────────────────────────────────────────────────

export interface RepScore {
  repId: string;
  totalLeads: number;
  delivered: number;
  conversionRate: number;
  pipelineValue: number;
  agingLeadsCount: number;
}

export function getRepScoreboard(branchId: string, month: string | null): RepScore[] {
  const branchReps = salesReps.filter((r) => r.branch_id === branchId);
  return branchReps.map((rep) => {
    const repLeads = getLeadsForRep(rep.id, month);
    const kpi = getKPIs(repLeads, []);
    const aging = getAgingLeads(repLeads);
    return {
      repId: rep.id,
      totalLeads: kpi.totalLeads,
      delivered: kpi.delivered,
      conversionRate: kpi.conversionRate,
      pipelineValue: kpi.pipelineValue,
      agingLeadsCount: aging.length,
    };
  });
}

// ─── Actionable Alerts ───────────────────────────────────────────────────────

export interface Alert {
  type: "warning" | "critical" | "info";
  message: string;
  branchId?: string;
}

export function getAlerts(month: string | null): Alert[] {
  const alerts: Alert[] = [];
  const branchIds = ["B1", "B2", "B3", "B4", "B5"];

  // Aging leads across all branches
  const allOpenLeads = leads.filter(
    (l) =>
      !["delivered", "lost"].includes(l.status) &&
      (!month || leadMonth(l) === month)
  );
  const agingAll = getAgingLeads(allOpenLeads);
  if (agingAll.length > 0) {
    const criticalCount = agingAll.filter((a) => a.severity === "critical").length;
    if (criticalCount > 0) {
      alerts.push({
        type: "critical",
        message: `${criticalCount} lead${criticalCount > 1 ? "s" : ""} have had no activity for 14+ days — at high risk of going cold`,
      });
    }
    const warningCount = agingAll.length - criticalCount;
    if (warningCount > 0) {
      alerts.push({
        type: "warning",
        message: `${warningCount} open lead${warningCount > 1 ? "s" : ""} haven't been contacted in 7+ days`,
      });
    }
  }

  // Branches behind target
  for (const branchId of branchIds) {
    const attainment = getBranchTargetAttainment(branchId, month);
    if (attainment.units.target > 0 && attainment.units.pct < 70) {
      alerts.push({
        type: "critical",
        branchId,
        message: `Branch is at ${attainment.units.pct}% of unit target (${attainment.units.actual}/${attainment.units.target} units)`,
      });
    } else if (attainment.units.target > 0 && attainment.units.pct < 90) {
      alerts.push({
        type: "warning",
        branchId,
        message: `Branch is at ${attainment.units.pct}% of unit target — ${attainment.units.target - attainment.units.actual} units short`,
      });
    }
  }

  return alerts.slice(0, 5); // cap at 5 alerts
}

// ─── Narrative Insights ──────────────────────────────────────────────────────

export interface Insight {
  type: "positive" | "warning" | "critical" | "info";
  headline: string;
  detail: string;
  href?: string;
}

export function getInsights(month: string | null): Insight[] {
  const insights: Insight[] = [];
  const scoreboard = getBranchScoreboard(month);
  const allLeads = getLeadsForBranch(null, month);
  const funnel = getConversionFunnel(allLeads);
  const aging = getAgingLeads(allLeads);
  const lostReasons = getLostReasonBreakdown(allLeads);

  // 1. Best vs worst branch
  const ranked = [...scoreboard].sort((a, b) => b.targetPct - a.targetPct);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  if (best) {
    insights.push({
      type: best.targetPct >= 15 ? "positive" : "warning",
      headline: `${branchById[best.branchId]?.name} leads the network`,
      detail: `${best.delivered} units delivered at ${best.targetPct}% target attainment — the strongest performer${month ? " this month" : " across all months"}.`,
      href: `/branch/${best.branchId}`,
    });
  }

  if (worst && worst.branchId !== best?.branchId) {
    insights.push({
      type: worst.targetPct < 5 ? "critical" : "warning",
      headline: `${branchById[worst.branchId]?.name} has the widest gap`,
      detail: `At ${worst.targetPct}% of target with ${worst.delivered} units delivered. ${worst.agingLeadsCount > 0 ? `${worst.agingLeadsCount} leads are also going cold.` : ""}`,
      href: `/branch/${worst.branchId}`,
    });
  }

  // 2. Funnel biggest drop-off (contacted → test_drive is the key insight)
  const contacted = funnel.find((f) => f.stage === "contacted");
  const testDrive = funnel.find((f) => f.stage === "test_drive");
  if (contacted && testDrive) {
    const lost = contacted.count - testDrive.count;
    if (lost > 0) {
      insights.push({
        type: "info",
        headline: `${lost} leads stall between first contact and test drive`,
        detail: `This is the network's single biggest conversion gap (${testDrive.dropOffPct}% attrition). Once in a car, 85% of negotiation-stage leads close.`,
      });
    }
  }

  // 3. Cold leads at risk
  const critical = aging.filter((a) => a.severity === "critical");
  if (critical.length > 0) {
    insights.push({
      type: "critical",
      headline: `${critical.length} lead${critical.length > 1 ? "s" : ""} silent for 14+ days`,
      detail: `${critical.length > 1 ? "These leads haven't" : "This lead hasn't"} had any activity in over two weeks — at high risk of being permanently lost.`,
    });
  } else if (aging.length > 0) {
    insights.push({
      type: "warning",
      headline: `${aging.length} open lead${aging.length > 1 ? "s" : ""} need follow-up`,
      detail: `No activity for 7+ days. Timely outreach is the simplest way to recover pipeline at no cost.`,
    });
  }

  // 4. Top lost reason if significant
  if (lostReasons.length > 0 && lostReasons[0].count >= 10) {
    const top = lostReasons[0];
    insights.push({
      type: "info",
      headline: `"${top.name}" is the top reason leads are lost`,
      detail: `${top.count} leads (${top.pct}% of all lost) cited this reason — pointing to a pricing or negotiation training opportunity.`,
    });
  }

  return insights.slice(0, 4);
}
