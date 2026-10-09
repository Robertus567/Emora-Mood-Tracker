"use client";

import { sfx } from "@/lib/sfx";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  "missing-env": {
    title: "Belum tersambung ke database",
    body: "Emora butuh DATABASE_URL dari Neon untuk menyimpan foto ke Galeri Mood. Tambahkan di file .env.local saat menjalankan lokal, atau di Environment Variables pada project Vercel, lalu redeploy.",
  },
  "db-error": {
    title: "Gagal menyambung ke database",
    body: "Koneksi ke Neon tidak berhasil. Periksa kembali nilai DATABASE_URL dan pastikan database-nya aktif.",
  },
};

export default function SetupNotice({ reason }) {
  const { t } = useLanguage();
  const copy = COPY[reason] || COPY["db-error"];
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
      <div className="max-w-md surface rounded-2xl p-8">
        <p className="text-[0.8rem] text-accent tracking-wide uppercase font-medium mb-3">
          {t("Pengaturan")}
        </p>
        <h1 className="font-display text-2xl mb-3">{t(copy.title)}</h1>
        <p className="text-soft leading-relaxed mb-6">{t(copy.body)}</p>
        <div className="flex items-center gap-4 flex-wrap">
          <a href="/api/health" onMouseEnter={sfx.hover} onClick={sfx.click} className="btn-secondary !py-2.5">
            {t("Cek status koneksi")}
          </a>
          <p className="text-[0.85rem] text-soft">
            {t("Langkah lengkap ada di README.md, bagian Setup Neon & Vercel.")}
          </p>
        </div>
      </div>
    </div>
  );
}
