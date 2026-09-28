# Emora — Pelacak Suasana Hati

Aplikasi web yang menyalakan kamera, mendeteksi ekspresi wajah (senang, sedih, marah,
biasa, dan beberapa ekspresi tambahan) secara langsung di browser, lalu mencatatnya
ke database lengkap dengan tanggal dan waktu. Dibangun dengan **Next.js 14**,
**face-api.js** (deteksi wajah 100% di sisi klien — video tidak pernah dikirim ke
server), dan **Neon Postgres** untuk penyimpanan.

## Fitur

- **Scan mood langsung** — kamera mendeteksi ekspresi secara real-time dengan
  bounding box & meter kepercayaan per ekspresi, lalu kamu tinggal menekan
  "Tangkap mood ini".
- **Catatan jurnal** — tambahkan catatan singkat opsional di setiap entri.
- **Streak & statistik** — hitungan hari beruntun, rekor terbaik, total catatan,
  mood terbanyak.
- **Kalender heatmap** — riwayat mood 18 minggu terakhir, mirip grafik kontribusi
  GitHub, diwarnai sesuai mood dominan tiap hari.
- **Grafik tren** — indeks suasana hati 14 hari terakhir.
- **Ekspor CSV** — unduh seluruh riwayat sebagai file CSV.
- **Filter foto seru** 🐱🐶🐰 — saat scanning, pilih filter telinga kucing/anjing/
  kelinci, lalu tekan tombol bundar putih untuk mengambil foto. Foto muncul di
  popup dan bisa langsung disimpan ke perangkatmu. Foto **tidak pernah** dikirim
  atau disimpan ke server/database — murni diproses & diunduh di browser.
- **VTuber Studio** (`/vtuber`) — avatar chibi (rubah, kucing, beruang, kelinci, robot,
  alien) yang mengikuti kedipan mata, bukaan mulut, alis, dan kemiringan kepalamu
  secara real-time. Semua diproses di browser; gambar avatar bisa diunduh.
- **Layout tanpa scroll** — di halaman Scan & VTuber, kamera dan panel mood tampil
  berdampingan sehingga bisa dilihat bersamaan.
- **Mode terang/gelap** dengan desain premium (grain, gradient, animasi hover halus).

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi DATABASE_URL (lihat langkah Neon di bawah)
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Tabel database dibuat otomatis
saat pertama kali ada request ke API (tidak perlu migrasi manual).

## Setup Neon & Vercel

### 1. Buat database di Neon

1. Buka [neon.tech](https://neon.tech) dan daftar/masuk (bisa langsung pakai akun GitHub).
2. Klik **New Project**, beri nama misalnya `emora`, pilih region terdekat (mis. Singapore),
   lalu klik **Create Project**.
3. Setelah project dibuat, buka tab **Connect** / **Connection Details**.
4. Salin **Connection string**-nya (pilih yang menggunakan *pooled connection* jika ada
   opsinya — biasanya ada centang "Pooled connection"). Bentuknya seperti:
   ```
   postgresql://user:password@ep-xxxxxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Simpan string ini — akan dipakai sebagai `DATABASE_URL`.

Kamu tidak perlu membuat tabel manual — aplikasi ini otomatis menjalankan
`CREATE TABLE IF NOT EXISTS` saat pertama kali diakses.

### 2. Push kode ke GitHub

```bash
git init
git add .
git commit -m "Emora — mood tracker"
git branch -M main
git remote add origin https://github.com/USERNAME/emora.git
git push -u origin main
```

(Ganti `USERNAME` dan nama repo sesuai punyamu. Buat repo kosong dulu di GitHub kalau
belum ada.)

### 3. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com), masuk pakai akun GitHub.
2. Klik **Add New → Project**, pilih repo `emora` yang tadi di-push.
3. Di halaman **Configure Project**, buka bagian **Environment Variables**, tambahkan:
   - **Key**: `DATABASE_URL`
   - **Value**: connection string dari Neon (langkah 1)
   - Centang untuk semua environment (Production, Preview, Development).
4. Klik **Deploy**. Tunggu proses build selesai (biasanya 1–2 menit).
5. Setelah selesai, Vercel akan memberi URL seperti `https://emora-xxxx.vercel.app` —
   buka URL itu, aplikasi sudah live dan tersambung ke Neon.

### 4. (Opsional) Sambungkan Neon ke Vercel lewat integrasi resmi

Sebagai alternatif langkah 3, kamu bisa membuka **Vercel → Storage → Connect Database
→ Neon**, ikuti wizard-nya, lalu Vercel akan otomatis mengisi environment variable
`DATABASE_URL` untuk kamu. Hasilnya sama saja dengan mengisi manual di atas.

## Catatan teknis

- Model deteksi wajah (`public/models`) sudah termasuk di dalam proyek (± 600 KB
  total) — tidak bergantung pada CDN pihak ketiga.
- Font (Inter & Fraunces) juga sudah di-*self-host* lewat `@fontsource`, tidak
  memanggil Google Fonts saat runtime.
- Setiap kali ada catatan baru, halaman Beranda & Riwayat selalu mengambil data
  terbaru langsung dari Neon (di-render dinamis, tidak di-cache statis).
- Skema tabel: `mood_entries(id, emotion, confidence, scores, note, created_at)`.

Selamat mencoba! 🎉


## Riwayat kosong? Cek koneksi database

Buka `https://DOMAIN-KAMU.vercel.app/api/health`. Endpoint ini menjawab apakah
`DATABASE_URL` terisi, apakah Neon merespons, dan berapa catatan yang tersimpan
(connection string tidak pernah ditampilkan). Jika `databaseUrlSet: false`, tambahkan
`DATABASE_URL` di Vercel (Settings → Environment Variables) lalu **Redeploy**.
Riwayat baru terisi setelah kamu menekan **Tangkap mood ini → Simpan ke log**
(tombol bundar putih hanya untuk foto filter, tidak menyimpan ke riwayat).
