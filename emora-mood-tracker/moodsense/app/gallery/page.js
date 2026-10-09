import { sql, ensureSchema } from "@/lib/db";
import GalleryView from "@/components/GalleryView";
import SetupNotice from "@/components/SetupNotice";
import { cookies } from "next/headers";
import { createTranslator, normalizeLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata() {
  const t = createTranslator(normalizeLocale(cookies().get("emora-locale")?.value));
  return { title: t("Galeri Mood | Emora") };
}

async function getPhotos() {
  if (!process.env.DATABASE_URL) return { photos: null, error: "missing-env" };
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT id, image_data, emotion, confidence, scores, created_at
      FROM gallery_photos ORDER BY created_at DESC LIMIT 120
    `;
    return { photos: rows, error: null };
  } catch (err) {
    return { photos: null, error: "db-error" };
  }
}

export default async function GalleryPage() {
  const { photos, error } = await getPhotos();

  if (error) {
    return <SetupNotice reason={error} />;
  }

  return <GalleryView photos={photos} />;
}
