"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { BreakdownItem } from "@/lib/analytics";

const COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DB2777", "#0891B2", "#DC2626"];

interface Props {
  data: BreakdownItem[];
  title?: string;
}

export default function ModelMixChart({ data, title = "Model Mix (Delivered)" }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-center h-40">
        <p className="text-sm text-slate-400">No deliveries in this period</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-xs text-slate-500 mb-4">Units delivered by model</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={20} />
          <Tooltip
            formatter={(v) => [v as number, "Units"]}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
