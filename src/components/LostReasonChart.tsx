"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { BreakdownItem } from "@/lib/analytics";

interface Props {
  data: BreakdownItem[];
  title?: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-900">{payload[0].value} leads</p>
    </div>
  );
}

export default function LostReasonChart({ data, title = "Lost Reason Breakdown" }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-center h-48">
        <p className="text-sm text-slate-400">No lost leads in this period</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-xs text-slate-500 mb-4">Why leads were lost</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#FB923C" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: "#64748B" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
