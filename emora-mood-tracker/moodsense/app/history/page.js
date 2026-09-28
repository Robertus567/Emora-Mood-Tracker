import { sql, ensureSchema } from "@/lib/db";
import HistoryView from "@/components/HistoryView";
import SetupNotice from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Riwayat — Emora",
};

async function getEntries() {
  if (!process.env.DATABASE_URL) return { entries: null, error: "missing-env" };
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT id, emotion, confidence, scores, note, created_at
      FROM mood_entries ORDER BY created_at DESC LIMIT 1000
    `;
    return { entries: rows, error: null };
  } catch {
    return { entries: null, error: "db-error" };
  }
}

export default async function HistoryPage() {
  const { entries, error } = await getEntries();
  if (error) return <SetupNotice reason={error} />;
  return <HistoryView entries={entries} />;
}
