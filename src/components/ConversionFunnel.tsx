"use client";

import type { FunnelData } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface Props {
  data: FunnelData[];
  title?: string;
}

const STAGE_STYLES = [
  { bg: "bg-slate-400",   text: "text-slate-700",   light: "bg-slate-100"  },
  { bg: "bg-blue-400",    text: "text-blue-700",    light: "bg-blue-50"    },
  { bg: "bg-violet-500",  text: "text-violet-700",  light: "bg-violet-50"  },
  { bg: "bg-amber-400",   text: "text-amber-700",   light: "bg-amber-50"   },
  { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50" },
  { bg: "bg-green-500",   text: "text-green-700",   light: "bg-green-50"   },
];

export default function ConversionFunnel({ data, title = "Conversion Funnel" }: Props) {
  const maxCount = data[0]?.count ?? 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <p className="text-xs text-slate-400 mt-0.5 mb-5">Pipeline stage progression</p>

      <div className="space-y-1.5">
        {data.map((stage, i) => {
          const style = STAGE_STYLES[i] ?? STAGE_STYLES[0];
          const widthPct = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 8) : 8;
          const retentionPct = maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;

          return (
            <div key={stage.stage}>
              {/* Drop-off connector */}
              {i > 0 && stage.dropOffPct > 0 && (
                <div className="flex items-center gap-1.5 py-1 pl-2">
                  <div className="w-px h-3 bg-slate-200 ml-1" />
                  <span className="text-xs text-red-500 font-semibold">↓ {stage.dropOffPct}% dropped</span>
                </div>
              )}

              {/* Funnel bar — centered, narrowing */}
              <div
                className="mx-auto transition-all duration-500"
                style={{ width: `${widthPct}%` }}
              >
                <div className={cn("rounded-lg px-3 py-2 flex items-center justify-between gap-2 animate-bar-grow", style.bg)}>
                  <span className="text-xs font-semibold text-white truncate">{stage.label}</span>
                  <span className="text-xs font-bold text-white whitespace-nowrap">{stage.count}</span>
                </div>
              </div>

              {/* Retention label below last bar */}
              {i === data.length - 1 && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  {retentionPct}% end-to-end retention
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
