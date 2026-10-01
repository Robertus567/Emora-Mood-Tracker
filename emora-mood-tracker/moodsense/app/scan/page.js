import FaceScanner from "@/components/FaceScanner";

export const metadata = {
  title: "Scan Mood — Emora",
};

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-7 sm:py-9 lg:h-[calc(100dvh-4.4rem)] lg:flex lg:flex-col">
      <div className="mb-6 shrink-0 flex items-end justify-between gap-4 flex-wrap">
        <div className="max-w-lg">
          <h1 className="font-display text-[1.7rem] sm:text-[2rem] leading-[1.15] mb-2">
            Posisikan wajahmu di dalam bingkai.
          </h1>
          <p className="text-soft text-sm leading-relaxed">
            Kamera dan hasil deteksinya tampil berdampingan. Tekan tombol rana untuk
            menangkap momen dan mood-mu, lalu simpan ke Galeri Mood bersama.
          </p>
        </div>
      </div>
      <div className="flex-1 lg:min-h-0">
        <FaceScanner />
      </div>
    </div>
  );
}
