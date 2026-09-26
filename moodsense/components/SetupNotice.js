const COPY = {
  "missing-env": {
    title: "Belum tersambung ke database",
    body: "Emora butuh DATABASE_URL dari Neon untuk menyimpan catatan mood. Tambahkan di file .env.local saat menjalankan lokal, atau di Environment Variables pada project Vercel.",
  },
  "db-error": {
    title: "Gagal menyambung ke database",
    body: "Koneksi ke Neon tidak berhasil. Periksa kembali nilai DATABASE_URL dan pastikan database-nya aktif.",
  },
};

export default function SetupNotice({ reason }) {
  const copy = COPY[reason] || COPY["db-error"];
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
      <div className="max-w-md">
        <p className="text-[0.8rem] text-soft mb-3">Pengaturan</p>
        <h1 className="font-display text-2xl mb-3">{copy.title}</h1>
        <p className="text-soft leading-relaxed mb-6">{copy.body}</p>
        <p className="text-[0.85rem] text-soft">
          Langkah lengkapnya ada di <code>README.md</code> pada folder project ini, bagian
          &ldquo;Setup Neon &amp; Vercel&rdquo;.
        </p>
      </div>
    </div>
  );
}
