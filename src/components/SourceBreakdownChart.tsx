"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { BreakdownItem } from "@/lib/analytics";

const SOURCE_COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DB2777", "#0891B2"];

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  walk_in: "Walk-In",
  referral: "Referral",
  social_media: "Social Media",
  phone_enquiry: "Phone",
  auto_expo: "Auto Expo",
};

interface Props {
  data: BreakdownItem[];
  title?: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { pct: number } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-900">{SOURCE_LABELS[payload[0].name] ?? payload[0].name}</p>
      <p className="text-slate-600">{payload[0].value} leads · {payload[0].payload.pct}%</p>
    </div>
  );
}

export default function SourceBreakdownChart({ data, title = "Lead Sources" }: Props) {
  const chartData = data.map((d) => ({
    ...d,
    displayName: SOURCE_LABELS[d.name] ?? d.name,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">{title}</h2>
      <p className="text-xs text-slate-500 mb-2">Where leads come from</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="displayName"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={35}
            paddingAngle={2}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: 10 }}
            formatter={(value) => <span className="text-slate-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
