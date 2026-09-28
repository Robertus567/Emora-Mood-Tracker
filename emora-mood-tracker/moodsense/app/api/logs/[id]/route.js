import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export async function DELETE(req, { params }) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }
    await sql`DELETE FROM mood_entries WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Gagal menghapus." }, { status: 500 });
  }
}
