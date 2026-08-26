"use client";

import type { Lead } from "@/types";
import { statusLabel, statusColor, formatShortDate, cn } from "@/lib/utils";

interface Props {
  lead: Lead;
}

function StatusDot({ status }: { status: string }) {
  if (status === "delivered") {
    return (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <circle cx="7" cy="7" r="6" fill="#16A34A" />
        <path d="M3.5 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "lost") {
    return (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <circle cx="7" cy="7" r="6" fill="#DC2626" />
        <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === "order_placed") {
    return (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <circle cx="7" cy="7" r="5" fill="#2563EB" />
        <circle cx="7" cy="7" r="2.5" fill="white" />
      </svg>
    );
  }
  if (status === "negotiation") {
    return (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <circle cx="7" cy="7" r="5" stroke="#7C3AED" strokeWidth="1.5" />
        <circle cx="7" cy="7" r="2" fill="#7C3AED" />
      </svg>
    );
  }
  if (status === "test_drive") {
    return (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <circle cx="7" cy="7" r="5" stroke="#0891B2" strokeWidth="1.5" />
        <circle cx="7" cy="7" r="1.5" fill="#0891B2" />
      </svg>
    );
  }
  if (status === "contacted") {
    return (
      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <circle cx="7" cy="7" r="5" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="7" cy="7" r="1.5" fill="#64748B" />
      </svg>
    );
  }
  // new
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden>
      <circle cx="7" cy="7" r="5" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

export default function LeadTimeline({ lead }: Props) {
  const history = lead.status_history ?? [];

  function daysBetween(a: string, b: string): number {
    const diff = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-0">
      {history.map((entry, i) => {
        const next = history[i + 1];
        const duration = next ? daysBetween(entry.timestamp, next.timestamp) : null;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-white border border-slate-200 shadow-sm">
                <StatusDot status={entry.status} />
              </div>
              {i < history.length - 1 && (
                <div className="w-px flex-1 bg-slate-200 my-1 min-h-[20px]" />
              )}
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", statusColor(entry.status))}>
                  {statusLabel(entry.status)}
                </span>
                <span className="text-xs text-slate-400">{formatShortDate(entry.timestamp)}</span>
                {duration !== null && (
                  <span className="text-xs text-slate-400 ml-auto">→ {duration}d</span>
                )}
              </div>
              {entry.note && entry.note.trim() && (
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
