import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { normalizeLocale, translate } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Visit /api/health directly in the browser to self-diagnose why photos
// might not be showing up in Galeri Mood. It never exposes the connection
// string itself — only whether it's set and whether Neon actually answers.
export async function GET(req) {
  const t = (text) => translate(normalizeLocale(req.cookies.get("emora-locale")?.value), text);
  const hasEnvVar = Boolean(process.env.DATABASE_URL);

  if (!hasEnvVar) {
    return NextResponse.json({
      ok: false,
      databaseUrlSet: false,
      message:
        t("DATABASE_URL tidak ditemukan di environment ini. Di Vercel: Project Settings → Environment Variables → tambahkan DATABASE_URL lalu redeploy."),
    });
  }

  try {
    await ensureSchema();
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM gallery_photos`;
    const [latest] = await sql`
      SELECT emotion, created_at FROM gallery_photos ORDER BY created_at DESC LIMIT 1
    `;
    return NextResponse.json({
      ok: true,
      databaseUrlSet: true,
      connected: true,
      totalEntries: count,
      latestEntry: latest || null,
      message:
        count === 0
          ? t("Terhubung ke Neon dengan baik, tapi tabel gallery_photos masih kosong, coba scan lalu tekan \"Simpan ke Galeri\" sampai selesai.")
          : `${t("Terhubung ke Neon. Ada")} ${count} ${t("catatan tersimpan.")}`,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      databaseUrlSet: true,
      connected: false,
      message:
        t("DATABASE_URL sudah diatur tapi koneksi ke Neon gagal. Periksa apakah connection string masih valid dan database Neon-nya aktif (tidak sedang \"sleeping\"/dihapus)."),
      error: err.message || String(err),
    });
  }
}
