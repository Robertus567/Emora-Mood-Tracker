"use client";

import { useMemo } from "react";
import { buildHeatmap } from "@/lib/stats";
import { emotionMeta } from "@/lib/emotions";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarHeatmap({ entries, weeks = 18 }) {
  const days = useMemo(() => buildHeatmap(entries, weeks), [entries, weeks]);

  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));
    return cols;
  }, [days]);

  const monthLabels = useMemo(() => {
    let lastMonth = null;
    return columns.map((col) => {
      const first = col[0];
      const m = first.date.toLocaleDateString("id-ID", { month: "short" });
      if (first.date.getDate() <= 7 && m !== lastMonth) {
        lastMonth = m;
        return m;
      }
      return "";
    });
  }, [columns]);

  return (
    <div className="surface rounded-2xl p-6 overflow-x-auto">
      <p className="text-[0.8rem] text-soft mb-4">{weeks} minggu terakhir</p>
      <div className="inline-flex gap-[3px] min-w-full">
        <div className="flex flex-col gap-[3px] mr-1 pt-[18px]">
          {DAY_LABELS.map((d, i) => (
            <div key={d} className="h-[13px] flex items-center">
              {i % 2 === 1 ? (
                <span className="text-[0.62rem] text-soft leading-none">{d}</span>
              ) : null}
            </div>
          ))}
        </div>
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            <div className="h-[14px] text-[0.62rem] text-soft leading-none">
              {monthLabels[ci]}
            </div>
            {col.map((day) => {
              const color = day.dominant ? emotionMeta(day.dominant).color : null;
              return (
                <div
                  key={day.key}
                  className="heat-cell"
                  title={`${day.date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                  })}${day.count ? ` — ${day.count} catatan, dominan ${emotionMeta(day.dominant).label}` : " — belum ada catatan"}`}
                  style={{
                    width: 13,
                    height: 13,
                    backgroundColor: color || "rgb(var(--bg-sunken))",
                    opacity: color ? Math.min(1, 0.55 + day.count * 0.15) : 1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
