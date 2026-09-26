import FaceScanner from "@/components/FaceScanner";

export const metadata = {
  title: "Scan Mood — Emora",
};

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-14 sm:py-16">
      <div className="mb-10 max-w-lg">
        <h1 className="font-display text-[1.9rem] sm:text-[2.2rem] leading-[1.15] mb-3">
          Posisikan wajahmu di dalam bingkai.
        </h1>
        <p className="text-soft leading-relaxed">
          Emora mendeteksi ekspresi secara langsung di kamera. Semua pemrosesan gambar
          terjadi di perangkatmu — hanya hasil deteksinya yang tersimpan ke log.
        </p>
      </div>
      <FaceScanner />
    </div>
  );
}
