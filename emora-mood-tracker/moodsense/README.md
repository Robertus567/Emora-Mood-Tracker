# Emora: Pelacak Suasana Hati

Aplikasi web yang menyalakan kamera, mendeteksi ekspresi wajah secara langsung di
browser (senang, sedih, marah, takut, jijik, terkejut, biasa), lalu menangkap
momennya ke **Galeri Mood** bersama lengkap dengan persentase tiap ekspresi. Ada
juga **Avatar**, karakter animasi yang bergerak mengikuti wajahmu secara real-time.
Dibangun dengan **Next.js 14**, **face-api.js** (deteksi wajah 100% di sisi klien),
dan **Neon Postgres** untuk penyimpanan.

## Fitur

- **Scan mood langsung**: kamera mendeteksi ekspresi secara real-time dengan
  bounding box & meter kepercayaan per ekspresi. Tekan tombol rana untuk menangkap
  momen (lengkap dengan filter seru 🐱🐶🐰 kalau dipakai), lihat rincian mood-nya,
  lalu simpan ke Galeri.
- **Galeri Mood** (`/gallery`): kumpulan foto hasil scan dari semua pengunjung,
  tiap foto menampilkan persentase ekspresi dominannya, bisa diunduh siapa saja,
  dan bisa dihapus langsung dari tombol di foto itu sendiri.
- **Avatar** (`/avatar`): pilih satu dari 7 karakter berilustrasi transparan
  (rubah, kucing, beruang, kelinci, robot, alien, atau anime). Mata dan mulut
  digambar di atas ilustrasi dengan posisi dan gaya khusus tiap karakter.
  Pratinjau ekspresi tersedia tanpa kamera. Saat kamera aktif, karakter
  mengikuti kedipan, bukaan mulut, arah kepala, dan tujuh ekspresi. Area mata
  dan mulut juga dianalisis secara lokal untuk memperkirakan arah pandang dan
  lidah; hasilnya dapat bervariasi mengikuti cahaya kamera. Gambar karakter
  bisa diunduh langsung. Animasi Canvas mengikuti refresh layar (termasuk
  120 Hz bila didukung), dengan smoothing berbasis waktu; pembacaan kamera
  tetap mengikuti kecepatan kamera dan inferensi model pada perangkat.
- **Efek suara**: setiap tombol punya bunyi saat disentuh kursor & saat diklik,
  plus bunyi rana kamera saat menangkap foto, semuanya disintesis langsung di
  browser (tidak ada file audio yang diunduh).
- **Layout tanpa scroll di desktop**: di halaman Scan & Avatar, kamera/karakter
  dan panel info tampil berdampingan tanpa perlu scroll; di layar sempit (ponsel/
  tablet) otomatis bertumpuk dan bisa discroll seperti biasa.
- **Mode terang/gelap** dengan desain premium (grain, gradient, animasi hover halus).
- **Bahasa Indonesia dan English**: gunakan tombol EN/ID di kanan atas. Pilihan
  tersimpan di cookie dan berlaku di seluruh halaman, label, pesan, serta status API.

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
   opsinya). Bentuknya seperti:
   ```
   postgresql://user:password@ep-xxxxxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Simpan string ini untuk dipakai sebagai `DATABASE_URL`.

Kamu tidak perlu membuat tabel manual. Aplikasi ini otomatis menjalankan
`CREATE TABLE IF NOT EXISTS` saat pertama kali diakses.

### 2. Push kode ke GitHub

```bash
git init
git add .
git commit -m "Emora mood tracker"
git branch -M main
git remote add origin https://github.com/USERNAME/emora.git
git push -u origin main
```

### 3. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com), masuk pakai akun GitHub.
2. Klik **Add New → Project**, pilih repo `emora` yang tadi di-push.
3. Di halaman **Configure Project**, buka bagian **Environment Variables**, tambahkan:
   - **Key**: `DATABASE_URL`
   - **Value**: connection string dari Neon (langkah 1)
   - Centang untuk semua environment (Production, Preview, Development).
4. Klik **Deploy**. Tunggu proses build selesai (biasanya 1–2 menit).
5. Setelah selesai, Vercel akan memberi URL seperti `https://emora-xxxx.vercel.app`,
   buka URL itu, aplikasi sudah live dan tersambung ke Neon.

### 4. (Opsional) Sambungkan Neon ke Vercel lewat integrasi resmi

Sebagai alternatif langkah 3, kamu bisa membuka **Vercel → Storage → Connect Database
→ Neon**, ikuti wizard-nya, lalu Vercel akan otomatis mengisi environment variable
`DATABASE_URL` untuk kamu.

## Galeri kosong? Cek koneksi database

Buka `https://DOMAIN-KAMU.vercel.app/api/health`. Endpoint ini menjawab apakah
`DATABASE_URL` terisi, apakah Neon merespons, dan berapa foto yang tersimpan
(connection string tidak pernah ditampilkan). Jika `databaseUrlSet: false`, tambahkan
`DATABASE_URL` di Vercel (Settings → Environment Variables) lalu **Redeploy**.
Galeri baru terisi setelah kamu menekan tombol rana di halaman Scan lalu
**Simpan ke Galeri**.

## Catatan teknis

- Model deteksi wajah (`public/models`) sudah termasuk di dalam proyek, tidak
  bergantung pada CDN pihak ketiga.
- Font (Inter, Fraunces, JetBrains Mono) juga sudah di-*self-host* lewat
  `@fontsource`, tidak memanggil Google Fonts saat runtime.
- Beranda & Galeri selalu mengambil data terbaru langsung dari Neon (di-render
  dinamis, tidak di-cache statis).
- Skema tabel: `gallery_photos(id, image_data, emotion, confidence, scores, created_at)`.
  `image_data` berisi foto dalam format JPEG base64, dikompresi ke lebar maksimum
  640px sebelum diunggah supaya ukuran baris tabel tetap wajar.
- Avatar & efek suara 100% berjalan di browser. Tidak ada data yang dikirim ke
  server untuk fitur itu; hanya gambar hasil scan mood yang diunggah ke Galeri.

Selamat mencoba! 🎉
