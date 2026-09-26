import { sql, ensureSchema } from "@/lib/db";
import DashboardView from "@/components/DashboardView";
import SetupNotice from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

async function getEntries() {
  if (!process.env.DATABASE_URL) return { entries: null, error: "missing-env" };
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT id, emotion, confidence, scores, note, created_at
      FROM mood_entries ORDER BY created_at DESC LIMIT 500
    `;
    return { entries: rows, error: null };
  } catch (err) {
    return { entries: null, error: "db-error" };
  }
}

export default async function DashboardPage() {
  const { entries, error } = await getEntries();

  if (error) {
    return <SetupNotice reason={error} />;
  }

  return <DashboardView entries={entries} />;
}
