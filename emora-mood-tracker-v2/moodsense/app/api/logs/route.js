import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export async function GET(req) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(1000, Number(searchParams.get("limit")) || 200);
    const rows = await sql`
      SELECT id, emotion, confidence, scores, note, created_at
      FROM mood_entries ORDER BY created_at DESC LIMIT ${limit}
    `;
    return NextResponse.json({ entries: rows });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Gagal mengambil data." }, { status: 500 });
  }
}

const VALID_EMOTIONS = new Set([
  "happy",
  "neutral",
  "sad",
  "angry",
  "surprised",
  "fearful",
  "disgusted",
]);

export async function POST(req) {
  try {
    await ensureSchema();
    const body = await req.json();
    const { emotion, confidence, scores, note } = body || {};

    if (!VALID_EMOTIONS.has(emotion)) {
      return NextResponse.json({ error: "Emosi tidak dikenali." }, { status: 400 });
    }
    if (typeof confidence !== "number" || confidence < 0 || confidence > 1) {
      return NextResponse.json({ error: "Nilai kepercayaan tidak valid." }, { status: 400 });
    }
    if (!scores || typeof scores !== "object") {
      return NextResponse.json({ error: "Data skor ekspresi hilang." }, { status: 400 });
    }

    const [row] = await sql`
      INSERT INTO mood_entries (emotion, confidence, scores, note)
      VALUES (${emotion}, ${confidence}, ${JSON.stringify(scores)}, ${note || null})
      RETURNING id, emotion, confidence, scores, note, created_at
    `;
    return NextResponse.json({ entry: row }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Gagal menyimpan." }, { status: 500 });
  }
}
