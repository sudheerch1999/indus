import type { Insight } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface Props {
  insights: Insight[];
  month: string | null;
}

const TYPE_STYLES = {
  positive: {
    border:  "border-emerald-200",
    bg:      "bg-emerald-50",
    iconBg:  "bg-emerald-100",
    dot:     "bg-emerald-500",
    heading: "text-emerald-900",
    body:    "text-emerald-800",
  },
  warning: {
    border:  "border-amber-200",
    bg:      "bg-amber-50",
    iconBg:  "bg-amber-100",
    dot:     "bg-amber-400",
    heading: "text-amber-900",
    body:    "text-amber-800",
  },
  critical: {
    border:  "border-red-200",
    bg:      "bg-red-50",
    iconBg:  "bg-red-100",
    dot:     "bg-red-500",
    heading: "text-red-900",
    body:    "text-red-800",
  },
  info: {
    border:  "border-blue-200",
    bg:      "bg-blue-50",
    iconBg:  "bg-blue-100",
    dot:     "bg-blue-400",
    heading: "text-blue-900",
    body:    "text-blue-800",
  },
};

const TYPE_ICONS = {
  positive: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="#16A34A" strokeWidth="1.5"/>
      <path d="M5 8l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden>
      <path d="M8 2L14.5 13H1.5L8 2Z" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 6.5V9" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.75" fill="#D97706"/>
    </svg>
  ),
  critical: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="#DC2626" strokeWidth="1.5"/>
      <path d="M8 5v3.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.75" fill="#DC2626"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="#2563EB" strokeWidth="1.5"/>
      <path d="M8 7v4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="0.75" fill="#2563EB"/>
    </svg>
  ),
};

export default function InsightSummary({ insights, month }: Props) {
  if (insights.length === 0) return null;

  const periodLabel = month
    ? new Date(month + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })
    : "Jun – Dec 2025";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden>
              <path d="M2 11l4-4 3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="4" r="1.5" fill="#E8192C"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Network Pulse</h2>
            <p className="text-xs text-slate-400">{periodLabel} · auto-generated from live data</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">{insights.length} insight{insights.length > 1 ? "s" : ""}</span>
      </div>

      {/* Insight rows */}
      <div className="divide-y divide-slate-50">
        {insights.map((insight, i) => {
          const s = TYPE_STYLES[insight.type];
          return (
            <div key={i} className={cn("px-6 py-4 flex items-start gap-4 transition-colors", insight.href ? "hover:bg-slate-50/60" : "")}>
              {/* Icon */}
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", s.iconBg)}>
                {TYPE_ICONS[insight.type]}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-snug">{insight.headline}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{insight.detail}</p>
              </div>

              {/* CTA */}
              {insight.href && (
                <a
                  href={insight.href}
                  className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap mt-0.5"
                >
                  View →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
