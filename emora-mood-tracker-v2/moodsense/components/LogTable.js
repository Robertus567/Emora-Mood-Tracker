"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { emotionMeta } from "@/lib/emotions";

const PAGE_SIZE = 25;

function toCsv(entries) {
  const header = ["tanggal", "waktu", "mood", "kepercayaan", "catatan"];
  const rows = entries.map((e) => {
    const d = new Date(e.created_at);
    const tanggal = d.toLocaleDateString("id-ID");
    const waktu = d.toLocaleTimeString("id-ID");
    const mood = emotionMeta(e.emotion).label;
    const conf = Math.round(e.confidence * 100) + "%";
    const note = (e.note || "").replace(/"/g, '""');
    return [tanggal, waktu, mood, conf, `"${note}"`].join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

function downloadCsv(entries) {
  const csv = toCsv(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `emora-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function LogTable({ entries }) {
  const router = useRouter();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [pendingId, setPendingId] = useState(null);

  async function handleDelete(id) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/logs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setPendingId(null);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="surface rounded-2xl p-10 text-center">
        <p className="text-soft text-sm">Belum ada catatan untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="surface rounded-2xl">
      <div className="flex items-center justify-between px-6 py-4">
        <p className="font-display text-lg">Semua catatan</p>
        <button
          onClick={() => downloadCsv(entries)}
          className="text-[0.8rem] font-medium text-soft hover:text-inherit focus-ring rounded link-underline"
        >
          Unduh CSV
        </button>
      </div>
      <ul className="divide-y hairline">
        {entries.slice(0, visible).map((e) => {
          const meta = emotionMeta(e.emotion);
          const d = new Date(e.created_at);
          return (
            <li key={e.id} className="flex items-center gap-4 px-6 py-3.5">
              <span className="h-8 w-1 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
              <span className="text-xl">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {meta.label}{" "}
                  <span className="text-soft font-normal">
                    · {Math.round(e.confidence * 100)}%
                  </span>
                </p>
                {e.note ? <p className="text-[0.8rem] text-soft truncate">{e.note}</p> : null}
              </div>
              <div className="text-right shrink-0 text-[0.78rem] text-soft">
                <p>{d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p>{d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                disabled={pendingId === e.id}
                aria-label={`Hapus catatan ${meta.label}`}
                className="shrink-0 text-soft hover:text-mood-anger disabled:opacity-40 focus-ring rounded p-1"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6M6 6l.6 10.2a1.5 1.5 0 0 0 1.5 1.4h3.8a1.5 1.5 0 0 0 1.5-1.4L14 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      {visible < entries.length && (
        <div className="px-6 py-4">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="text-[0.8rem] font-medium text-soft hover:text-inherit focus-ring rounded"
          >
            Tampilkan lebih banyak ({entries.length - visible} lagi)
          </button>
        </div>
      )}
    </div>
  );
}
