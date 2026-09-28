"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, LayoutGrid, Sparkles, ArrowUpRight } from "lucide-react";
import { emotionMeta, EMOTION_ORDER } from "@/lib/emotions";
import { computeStreak, buildDistribution, toDateKey } from "@/lib/stats";
import MoodHeroArt from "@/components/MoodHeroArt";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function EmberBadge({ streak }) {
  const size = Math.min(80, 48 + streak * 2.5);
  const glow = Math.min(0.9, 0.35 + streak * 0.05);
  return (
    <div className="relative shrink-0 grid place-items-center" style={{ width: 80, height: 80 }}>
      <div
        className="rounded-full transition-all duration-500"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 30%, rgba(224,138,43,${glow}), rgba(224,138,43,0.05) 70%)`,
          boxShadow: `0 0 ${20 + streak * 2}px rgba(224,138,43,${glow * 0.5})`,
        }}
      />
      <Flame className="absolute h-6 w-6 text-ember-500" strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
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
      <div className="surface rounded-2xl p-6 h-full flex flex-col justify-between gap-6">
        <p className="text-[0.8rem] text-soft tracking-wide uppercase font-medium">
          Spektrum 7 hari terakhir
        </p>
        <p className="text-soft text-sm leading-relaxed">
          Belum ada catatan minggu ini. Mulai scan supaya spektrummu muncul di sini.
        </p>
        <Link href="/scan" className="text-sm font-medium text-accent link-underline w-fit">
          Scan sekarang →
        </Link>
      </div>
    );
  }

  return (
    <div className="surface rounded-2xl p-6 h-full flex flex-col gap-5">
      <p className="text-[0.8rem] text-soft tracking-wide uppercase font-medium">
        Spektrum 7 hari terakhir
      </p>
      <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-[1.5px]">
        {present.map((key) => (
          <motion.div
            key={key}
            initial={{ width: 0 }}
            animate={{ width: `${(counts[key] / total) * 100}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: emotionMeta(key).color }}
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
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.label}
              </span>
              <span className="text-soft num-mono text-[0.8rem]">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecentRow({ entry, index }) {
  const meta = emotionMeta(entry.emotion);
  const date = new Date(entry.created_at);
  const time = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-4 py-3.5"
    >
      <span className="h-8 w-1 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
      <span className="text-xl">{meta.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{meta.label}</p>
        {entry.note ? <p className="text-[0.8rem] text-soft truncate">{entry.note}</p> : null}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[0.8rem] text-soft num-mono">{day}</p>
        <p className="text-[0.75rem] text-soft num-mono">{time}</p>
      </div>
    </motion.li>
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
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center mb-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col justify-center"
        >
          <p className="text-[0.8rem] font-medium text-accent tracking-[0.14em] uppercase mb-4 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
            Deteksi ekspresi real-time
          </p>
          <h1 className="font-display text-[2.3rem] sm:text-[2.9rem] leading-[1.1] mb-5 max-w-lg">
            Kenali <span className="italic gradient-text">suasana hatimu</span>, satu tatapan
            kamera.
          </h1>
          <p className="text-soft leading-relaxed max-w-md mb-8">
            Emora membaca ekspresi wajahmu langsung di perangkatmu sendiri, lalu mencatat
            hasilnya lengkap dengan tanggal dan waktu. Tidak ada rekaman yang tersimpan
            atau dikirim — hanya hasil deteksinya.
          </p>
          <div className="flex items-center gap-5 flex-wrap">
            <Link href="/scan" className="btn-primary">
              {loggedToday ? "Scan lagi" : "Scan mood pertamamu"}
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-soft hover:text-inherit focus-ring rounded flex items-center gap-1 link-underline"
            >
              Lihat riwayat <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <MoodHeroArt />
        </motion.div>
      </div>

      {totalAll === 0 ? (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="surface rounded-2xl p-10 text-center max-w-lg mx-auto"
        >
          <p className="font-display text-xl mb-2">Belum ada catatan</p>
          <p className="text-soft text-sm leading-relaxed">
            Catatan pertamamu akan muncul di sini lengkap dengan grafik dan kalender mood.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="surface surface-interactive rounded-2xl p-6 flex items-center gap-5"
            >
              <EmberBadge streak={current} />
              <div>
                <p className="font-display text-lg leading-tight num-mono">
                  {current > 0 ? `${current} hari beruntun` : "Mulai catat hari ini"}
                </p>
                <p className="text-soft text-sm mt-1">Rekor terbaik: {best} hari</p>
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.08 }}
              className="surface surface-interactive rounded-2xl p-6 flex flex-col justify-center"
            >
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid className="h-4 w-4 text-accent" strokeWidth={2} />
                <p className="font-display text-3xl num-mono">{totalAll}</p>
              </div>
              <p className="text-soft text-sm mt-1">Total catatan</p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.16 }}
              className="surface surface-interactive rounded-2xl p-6 flex flex-col justify-center"
            >
              <p className="font-display text-3xl">
                {dominantAll ? emotionMeta(dominantAll).emoji : "—"}
              </p>
              <p className="text-soft text-sm mt-1">
                Mood terbanyak: {dominantAll ? emotionMeta(dominantAll).label : "-"}
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-[0.9fr_1.3fr] gap-4">
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.22 }}>
              <WeeklySpectrum entries={entries} />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.28 }}
              className="surface rounded-2xl px-6"
            >
              <div className="flex items-center justify-between py-4">
                <p className="font-display text-lg">Catatan terbaru</p>
                <Link
                  href="/history"
                  className="text-[0.8rem] text-soft hover:text-inherit focus-ring rounded link-underline"
                >
                  Semua riwayat
                </Link>
              </div>
              <ul className="divide-y hairline">
                {entries.slice(0, 6).map((e, i) => (
                  <RecentRow key={e.id} entry={e} index={i} />
                ))}
              </ul>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
