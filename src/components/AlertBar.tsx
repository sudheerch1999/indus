"use client";

import type { Alert } from "@/lib/analytics";
import { branchById } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  alerts: Alert[];
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="#16A34A" strokeWidth="1.5"/>
      <path d="M5 8l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CriticalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2L14.5 13H1.5L8 2Z" stroke="#DC2626" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 6.5V9" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.75" fill="#DC2626"/>
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="#D97706" strokeWidth="1.5"/>
      <path d="M8 5v3.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.75" fill="#D97706"/>
    </svg>
  );
}

export default function AlertBar({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5">
        <CheckIcon />
        <div>
          <p className="text-sm font-semibold text-emerald-800">All systems healthy</p>
          <p className="text-xs text-emerald-600 mt-0.5">No critical issues detected across the network</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-2xl px-5 py-3.5 border-l-4",
            alert.type === "critical"
              ? "bg-red-50 border-red-500 border border-red-200"
              : "bg-amber-50 border-amber-400 border border-amber-200"
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {alert.type === "critical" ? <CriticalIcon /> : <WarningIcon />}
          </div>
          <div className="min-w-0">
            <p className={cn("text-sm font-semibold leading-snug", alert.type === "critical" ? "text-red-900" : "text-amber-900")}>
              {alert.branchId && (
                <a
                  href={`/branch/${alert.branchId}`}
                  className="underline underline-offset-2 mr-1.5 hover:opacity-75 transition-opacity"
                >
                  {branchById[alert.branchId]?.name}
                </a>
              )}
              {alert.message}
            </p>
          </div>
          {alert.branchId && (
            <a
              href={`/branch/${alert.branchId}`}
              className={cn(
                "flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ml-auto whitespace-nowrap",
                alert.type === "critical"
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              )}
            >
              View →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
