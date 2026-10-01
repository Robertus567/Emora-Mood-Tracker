import { sql, ensureSchema } from "@/lib/db";
import DashboardView from "@/components/DashboardView";
import SetupNotice from "@/components/SetupNotice";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPhotos() {
  if (!process.env.DATABASE_URL) return { photos: null, error: "missing-env" };
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT id, image_data, emotion, confidence, scores, created_at
      FROM gallery_photos ORDER BY created_at DESC LIMIT 6
    `;
    return { photos: rows, error: null };
  } catch (err) {
    return { photos: null, error: "db-error" };
  }
}

export default async function DashboardPage() {
  const { photos, error } = await getPhotos();

  if (error) {
    return <SetupNotice reason={error} />;
  }

  return <DashboardView photos={photos} />;
}
