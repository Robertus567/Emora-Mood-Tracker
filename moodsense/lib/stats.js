import { EMOTION_ORDER } from "./emotions";

// Rough valence weight per emotion, used to plot a single "mood index" line.
const VALENCE = {
  happy: 1,
  surprised: 0.4,
  neutral: 0,
  sad: -0.8,
  fearful: -0.6,
  disgusted: -0.5,
  angry: -1,
};

export function toDateKey(d) {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Consecutive-day streak (today or yesterday counts as "current"),
// plus the best streak ever seen in the given entries.
export function computeStreak(entries) {
  if (!entries.length) return { current: 0, best: 0 };
  const days = new Set(entries.map((e) => toDateKey(e.created_at)));
  const sorted = Array.from(days).sort();

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diff = Math.round((cur - prev) / 86400000);
    run = diff === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const todayKey = toDateKey(new Date());
  const yestKey = toDateKey(new Date(Date.now() - 86400000));
  let current = 0;
  if (days.has(todayKey) || days.has(yestKey)) {
    let cursor = days.has(todayKey) ? new Date() : new Date(Date.now() - 86400000);
    while (days.has(toDateKey(cursor))) {
      current += 1;
      cursor = new Date(cursor.getTime() - 86400000);
    }
  }
  return { current, best: Math.max(best, current) };
}

// Grid of the last `weeks*7` days (default ~20 weeks) with the dominant
// emotion for each day that has at least one entry.
export function buildHeatmap(entries, weeks = 20) {
  const byDay = new Map();
  for (const e of entries) {
    const key = toDateKey(e.created_at);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(e);
  }

  const totalDays = weeks * 7;
  const today = startOfDay(new Date());
  const start = new Date(today.getTime() - (totalDays - 1) * 86400000);
  // Align to the previous Sunday so the grid forms clean weekly columns.
  const startAligned = new Date(start.getTime() - start.getDay() * 86400000);

  const days = [];
  for (let i = 0; i < totalDays + 7; i++) {
    const d = new Date(startAligned.getTime() + i * 86400000);
    if (d > today) break;
    const key = toDateKey(d);
    const dayEntries = byDay.get(key) || [];
    let dominant = null;
    if (dayEntries.length) {
      const counts = {};
      for (const e of dayEntries) counts[e.emotion] = (counts[e.emotion] || 0) + 1;
      dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }
    days.push({ key, date: d, dominant, count: dayEntries.length });
  }
  return days;
}

// Emotion counts across all given entries (already filtered by caller if needed).
export function buildDistribution(entries) {
  const counts = {};
  for (const key of EMOTION_ORDER) counts[key] = 0;
  for (const e of entries) counts[e.emotion] = (counts[e.emotion] || 0) + 1;
  const total = entries.length;
  return { counts, total };
}

// Daily mood-index trend for the last `days` days (default 14).
export function buildDailyTrend(entries, days = 14) {
  const byDay = new Map();
  for (const e of entries) {
    const key = toDateKey(e.created_at);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(e);
  }
  const today = startOfDay(new Date());
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = toDateKey(d);
    const dayEntries = byDay.get(key) || [];
    let index = null;
    if (dayEntries.length) {
      const sum = dayEntries.reduce((acc, e) => acc + (VALENCE[e.emotion] ?? 0), 0);
      index = sum / dayEntries.length;
    }
    out.push({
      key,
      label: d.toLocaleDateString("id-ID", { weekday: "short" }),
      dateLabel: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      index,
      count: dayEntries.length,
    });
  }
  return out;
}
