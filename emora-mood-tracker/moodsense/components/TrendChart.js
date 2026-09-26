"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { buildDailyTrend } from "@/lib/stats";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  if (p.index === null) {
    return (
      <div className="surface rounded-lg px-3 py-2 text-[0.75rem] shadow-lift">
        {p.dateLabel} — tidak ada catatan
      </div>
    );
  }
  const mood = p.index > 0.15 ? "Cenderung positif" : p.index < -0.15 ? "Cenderung berat" : "Netral";
  return (
    <div className="surface rounded-lg px-3 py-2 text-[0.75rem] shadow-lift">
      <p className="font-medium mb-0.5">{p.dateLabel}</p>
      <p className="text-soft">{mood} · {p.count} catatan</p>
    </div>
  );
}

export default function TrendChart({ entries }) {
  const data = useMemo(() => buildDailyTrend(entries, 14), [entries]);
  const hasAny = data.some((d) => d.index !== null);

  return (
    <div className="surface rounded-2xl p-6">
      <p className="text-[0.8rem] text-soft mb-4">Indeks suasana hati · 14 hari terakhir</p>
      {!hasAny ? (
        <p className="text-soft text-sm py-10 text-center">Belum cukup data untuk grafik ini.</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8A93B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#E8A93B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "rgb(var(--text-soft))" }}
            />
            <YAxis hide domain={[-1, 1]} />
            <ReferenceLine y={0} stroke="rgb(var(--line-strong))" strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="index"
              stroke="#E8A93B"
              strokeWidth={2}
              fill="url(#moodFill)"
              connectNulls
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
