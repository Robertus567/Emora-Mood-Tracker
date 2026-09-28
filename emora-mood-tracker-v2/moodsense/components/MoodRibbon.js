"use client";

import { emotionMeta } from "@/lib/emotions";

export default function MoodRibbon({ ticks }) {
  if (!ticks || ticks.length === 0) {
    return (
      <div className="h-[3px] w-full surface-sunken" aria-hidden="true" />
    );
  }

  return (
    <div
      className="flex h-[5px] w-full"
      role="img"
      aria-label="Spektrum suasana hati terakhir"
      title="Spektrum suasana hati terakhirmu"
    >
      {ticks.map((t, i) => {
        const meta = emotionMeta(t.emotion);
        return (
          <div
            key={i}
            className="flex-1 h-full"
            style={{ backgroundColor: meta.color }}
          />
        );
      })}
    </div>
  );
}
