import CalendarHeatmap from "@/components/CalendarHeatmap";
import TrendChart from "@/components/TrendChart";
import LogTable from "@/components/LogTable";

export default function HistoryView({ entries }) {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-14 sm:py-16">
      <div className="mb-10 max-w-lg">
        <p className="text-[0.8rem] font-medium text-accent tracking-[0.14em] uppercase mb-3">
          Jejak mood
        </p>
        <h1 className="font-display text-[1.9rem] sm:text-[2.2rem] leading-[1.15] mb-3">
          Riwayat <span className="italic gradient-text">suasana hatimu</span>.
        </h1>
        <p className="text-soft leading-relaxed">
          Setiap warna mewakili satu ekspresi. Arahkan kursor ke kotak kalender untuk
          melihat detail harinya.
        </p>
      </div>

      <div className="grid gap-5 mb-5">
        <CalendarHeatmap entries={entries} />
        <TrendChart entries={entries} />
      </div>

      <LogTable entries={entries} />
    </div>
  );
}
