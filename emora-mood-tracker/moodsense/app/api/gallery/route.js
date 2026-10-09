import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { normalizeLocale, translate } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_EMOTIONS = new Set([
  "happy",
  "neutral",
  "sad",
  "angry",
  "surprised",
  "fearful",
  "disgusted",
]);

export async function GET(req) {
  const t = (text) => translate(normalizeLocale(req.cookies.get("emora-locale")?.value), text);
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(200, Number(searchParams.get("limit")) || 120);
    const rows = await sql`
      SELECT id, image_data, emotion, confidence, scores, created_at
      FROM gallery_photos ORDER BY created_at DESC LIMIT ${limit}
    `;
    return NextResponse.json({ photos: rows });
  } catch (err) {
    return NextResponse.json({ error: err.message || t("Gagal mengambil galeri.") }, { status: 500 });
  }
}

export async function POST(req) {
  const t = (text) => translate(normalizeLocale(req.cookies.get("emora-locale")?.value), text);
  try {
    await ensureSchema();
    const body = await req.json();
    const { imageData, emotion, confidence, scores } = body || {};

    if (!VALID_EMOTIONS.has(emotion)) {
      return NextResponse.json({ error: t("Emosi tidak dikenali.") }, { status: 400 });
    }
    if (typeof confidence !== "number" || confidence < 0 || confidence > 1) {
      return NextResponse.json({ error: t("Nilai kepercayaan tidak valid.") }, { status: 400 });
    }
    if (!scores || typeof scores !== "object") {
      return NextResponse.json({ error: t("Data skor ekspresi hilang.") }, { status: 400 });
    }
    if (typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
      return NextResponse.json({ error: t("Data gambar tidak valid.") }, { status: 400 });
    }
    // ~2.5MB decoded ceiling so nobody can balloon the database with huge uploads.
    if (imageData.length > 3_400_000) {
      return NextResponse.json({ error: t("Ukuran gambar terlalu besar.") }, { status: 400 });
    }

    const [row] = await sql`
      INSERT INTO gallery_photos (image_data, emotion, confidence, scores)
      VALUES (${imageData}, ${emotion}, ${confidence}, ${JSON.stringify(scores)})
      RETURNING id, emotion, confidence, scores, created_at
    `;
    return NextResponse.json({ photo: row }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || t("Gagal menyimpan ke galeri.") }, { status: 500 });
  }
}
