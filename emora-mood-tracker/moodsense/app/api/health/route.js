import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Visit /api/health directly in the browser to self-diagnose why entries
// might not be showing up in Riwayat. It never exposes the connection
// string itself — only whether it's set and whether Neon actually answers.
export async function GET() {
  const hasEnvVar = Boolean(process.env.DATABASE_URL);

  if (!hasEnvVar) {
    return NextResponse.json({
      ok: false,
      databaseUrlSet: false,
      message:
        "DATABASE_URL tidak ditemukan di environment ini. Di Vercel: Project Settings → Environment Variables → tambahkan DATABASE_URL lalu redeploy.",
    });
  }

  try {
    await ensureSchema();
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM mood_entries`;
    const [latest] = await sql`
      SELECT emotion, created_at FROM mood_entries ORDER BY created_at DESC LIMIT 1
    `;
    return NextResponse.json({
      ok: true,
      databaseUrlSet: true,
      connected: true,
      totalEntries: count,
      latestEntry: latest || null,
      message:
        count === 0
          ? "Terhubung ke Neon dengan baik, tapi tabel mood_entries masih kosong — coba scan lalu tekan \"Simpan ke log\" sampai selesai."
          : `Terhubung ke Neon. Ada ${count} catatan tersimpan.`,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      databaseUrlSet: true,
      connected: false,
      message:
        "DATABASE_URL sudah diatur tapi koneksi ke Neon gagal. Periksa apakah connection string masih valid dan database Neon-nya aktif (tidak sedang \"sleeping\"/dihapus).",
      error: err.message || String(err),
    });
  }
}
