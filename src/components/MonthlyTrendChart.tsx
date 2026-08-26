"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyTrendPoint } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: MonthlyTrendPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-medium text-slate-900">
            {p.name.includes("Revenue") || p.name.includes("Target Rev")
              ? formatCurrency(p.value)
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MonthlyTrendChart({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">Monthly Performance</h2>
      <p className="text-xs text-slate-500 mb-4">Units delivered vs target, revenue trend</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="units"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconSize={8}
            iconType="circle"
          />
          <Bar yAxisId="units" dataKey="target_units" name="Target Units" fill="#E2E8F0" radius={[3, 3, 0, 0]} barSize={20} />
          <Bar yAxisId="units" dataKey="delivered" name="Delivered" fill="url(#deliveredGrad)" radius={[3, 3, 0, 0]} barSize={20} />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#DC2626"
            strokeWidth={2}
            dot={{ r: 3, fill: "#DC2626" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
