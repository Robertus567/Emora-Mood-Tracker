import VtuberStudio from "@/components/VtuberStudio";

export const metadata = {
  title: "VTuber — Emora",
};

export default function VtuberPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-7 sm:py-9 lg:h-[calc(100dvh-4.4rem)] lg:flex lg:flex-col">
      <div className="mb-6 shrink-0 flex items-end justify-between gap-4 flex-wrap">
        <div className="max-w-lg">
          <h1 className="font-display text-[1.7rem] sm:text-[2rem] leading-[1.15] mb-2">
            Jadikan wajahmu <span className="italic gradient-text">avatar hidup</span>.
          </h1>
          <p className="text-soft text-sm leading-relaxed">
            Mata, mulut, alis, dan kemiringan kepalamu digerakkan langsung ke karakter
            pilihanmu — semuanya diproses di perangkatmu sendiri.
          </p>
        </div>
      </div>
      <div className="flex-1 lg:min-h-0">
        <VtuberStudio />
      </div>
    </div>
  );
}
