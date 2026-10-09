import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { normalizeLocale, translate } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(req, { params }) {
  const t = (text) => translate(normalizeLocale(req.cookies.get("emora-locale")?.value), text);
  try {
    await ensureSchema();
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: t("ID tidak valid.") }, { status: 400 });
    }
    const [row] = await sql`DELETE FROM gallery_photos WHERE id = ${id} RETURNING id`;
    if (!row) {
      return NextResponse.json({ error: t("Foto tidak ditemukan.") }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    return NextResponse.json({ error: err.message || t("Gagal menghapus foto.") }, { status: 500 });
  }
}
