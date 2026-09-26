"use client";

import Link from "next/link";
import { useMemo } from "react";
import { emotionMeta, EMOTION_ORDER } from "@/lib/emotions";
import { computeStreak, buildDistribution, toDateKey } from "@/lib/stats";

function EmberBadge({ streak }) {
  const size = Math.min(96, 56 + streak * 3);
  const glow = Math.min(0.9, 0.35 + streak * 0.05);
  return (
    <div
      className="relative shrink-0 grid place-items-center rounded-full"
      style={{ width: 96, height: 96 }}
    >
      <div
        className="rounded-full transition-all duration-500"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 30%, rgba(232,169,59,${glow}), rgba(232,169,59,0.05) 70%)`,
          boxShadow: `0 0 ${20 + streak * 2}px rgba(232,169,59,${glow * 0.5})`,
        }}
      />
      <span className="absolute font-display text-2xl">{streak}</span>
    </div>
  );
}

function WeeklySpectrum({ entries }) {
  const since = Date.now() - 7 * 86400000;
  const recent = entries.filter((e) => new Date(e.created_at).getTime() >= since);
  const { counts, total } = buildDistribution(recent);
  const present = EMOTION_ORDER.filter((k) => counts[k] > 0);

  if (total === 0) {
    return (
      <div className="surface rounded-2xl p-6 h-full flex flex-col justify-between">
        <p className="text-[0.8rem] text-soft">Spektrum 7 hari terakhir</p>
        <p className="text-soft text-sm leading-relaxed">
          Belum ada catatan minggu ini. Mulai scan supaya spektrummu muncul di sini.
        </p>
        <div />
      </div>
    );
  }

  return (
    <div className="surface rounded-2xl p-6 h-full flex flex-col gap-5">
      <p className="text-[0.8rem] text-soft">Spektrum 7 hari terakhir</p>
      <div className="flex h-3 w-full rounded-full overflow-hidden">
        {present.map((key) => (
          <div
            key={key}
            style={{
              width: `${(counts[key] / total) * 100}%`,
              backgroundColor: emotionMeta(key).color,
            }}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-2.5">
        {present.map((key) => {
          const meta = emotionMeta(key);
          const pct = Math.round((counts[key] / total) * 100);
          return (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.label}
              </span>
              <span className="text-soft">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecentRow({ entry }) {
  const meta = emotionMeta(entry.emotion);
  const date = new Date(entry.created_at);
  const time = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return (
    <li className="flex items-center gap-4 py-3.5">
      <span className="h-8 w-1 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
      <span className="text-xl">{meta.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{meta.label}</p>
        {entry.note ? (
          <p className="text-[0.8rem] text-soft truncate">{entry.note}</p>
        ) : null}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[0.8rem] text-soft">{day}</p>
        <p className="text-[0.75rem] text-soft">{time}</p>
      </div>
    </li>
  );
}

export default function DashboardView({ entries }) {
  const { current, best } = useMemo(() => computeStreak(entries), [entries]);
  const totalAll = entries.length;
  const dominantAll = useMemo(() => {
    if (!entries.length) return null;
    const { counts } = buildDistribution(entries);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [entries]);
  const loggedToday = useMemo(() => {
    const todayKey = toDateKey(new Date());
    return entries.some((e) => toDateKey(e.created_at) === todayKey);
  }, [entries]);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-stretch mb-14">
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-[2.1rem] sm:text-[2.6rem] leading-[1.12] mb-5 max-w-lg">
            Kenali suasana hatimu, satu tatapan kamera.
          </h1>
          <p className="text-soft leading-relaxed max-w-md mb-8">
            Emora membaca ekspresi wajahmu langsung di perangkatmu sendiri, lalu mencatat
            hasilnya lengkap dengan tanggal dan waktu. Tidak ada rekaman yang tersimpan
            atau dikirim — hanya hasil deteksinya.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/scan" className="btn-primary">
              {loggedToday ? "Scan lagi" : "Scan mood pertamamu"}
            </Link>
            <Link href="/history" className="text-sm font-medium text-soft hover:text-inherit focus-ring rounded">
              Lihat riwayat
            </Link>
          </div>
        </div>
        <WeeklySpectrum entries={entries} />
      </div>

      {totalAll === 0 ? (
        <div className="surface rounded-2xl p-10 text-center max-w-lg mx-auto">
          <p className="font-display text-xl mb-2">Belum ada catatan</p>
          <p className="text-soft text-sm leading-relaxed">
            Catatan pertamamu akan muncul di sini lengkap dengan grafik dan kalender mood.
          </p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-[1.2fr_1fr_1fr] gap-4 mb-4">
            <div className="surface rounded-2xl p-6 flex items-center gap-5">
              <EmberBadge streak={current} />
              <div>
                <p className="font-display text-lg leading-tight">
                  {current > 0 ? `${current} hari beruntun` : "Mulai catat hari ini"}
                </p>
                <p className="text-soft text-sm mt-1">Rekor terbaik: {best} hari</p>
              </div>
            </div>
            <div className="surface rounded-2xl p-6 flex flex-col justify-center">
              <p className="font-display text-3xl">{totalAll}</p>
              <p className="text-soft text-sm mt-1">Total catatan</p>
            </div>
            <div className="surface rounded-2xl p-6 flex flex-col justify-center">
              <p className="font-display text-3xl">
                {dominantAll ? emotionMeta(dominantAll).emoji : "—"}
              </p>
              <p className="text-soft text-sm mt-1">
                Mood terbanyak: {dominantAll ? emotionMeta(dominantAll).label : "-"}
              </p>
            </div>
          </div>

          <div className="surface rounded-2xl px-6">
            <div className="flex items-center justify-between py-4">
              <p className="font-display text-lg">Catatan terbaru</p>
              <Link href="/history" className="text-[0.8rem] text-soft hover:text-inherit focus-ring rounded">
                Semua riwayat
              </Link>
            </div>
            <ul className="divide-y hairline">
              {entries.slice(0, 6).map((e) => (
                <RecentRow key={e.id} entry={e} />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
