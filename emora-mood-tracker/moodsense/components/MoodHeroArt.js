"use client";

import { motion } from "framer-motion";

const CHIPS = [
  { emoji: "😄", label: "Senang", radius: 148, duration: 22, start: 0, size: "top" },
  { emoji: "😌", label: "Tenang", radius: 168, duration: 28, start: 120, size: "bottom" },
  { emoji: "😲", label: "Terkejut", radius: 132, duration: 19, start: 240, size: "top" },
];

function OrbitChip({ chip }) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{ transformOrigin: "50% 50%" }}
      animate={{ rotate: chip.start + 360 }}
      transition={{ repeat: Infinity, duration: chip.duration, ease: "linear" }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(-50%, -50%) translateX(${chip.radius}px)` }}
      >
        <motion.div
          animate={{ rotate: -(chip.start + 360) }}
          transition={{ repeat: Infinity, duration: chip.duration, ease: "linear" }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: chip.start / 60 }}
            className="surface-glass flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1.5 shadow-lift"
          >
            <span className="text-base leading-none">{chip.emoji}</span>
            <span className="text-[0.68rem] font-medium text-soft whitespace-nowrap">
              {chip.label}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function MoodHeroArt() {
  return (
    <div className="relative h-full min-h-[320px] sm:min-h-[380px] grid place-items-center overflow-visible">
      {/* ambient glow behind everything */}
      <div
        className="glow-orb"
        style={{
          width: 340,
          height: 340,
          background: "radial-gradient(circle, rgb(var(--accent) / 0.28) 0%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      {/* dashed orbit guide rings */}
      <div
        className="absolute rounded-full border border-dashed animate-spin-slow"
        style={{ width: 296, height: 296, borderColor: "rgb(var(--line-strong))" }}
        aria-hidden="true"
      />
      <div
        className="absolute rounded-full border animate-spin-slow"
        style={{
          width: 336,
          height: 336,
          borderColor: "rgb(var(--line))",
          animationDirection: "reverse",
          animationDuration: "34s",
        }}
        aria-hidden="true"
      />

      {CHIPS.map((chip) => (
        <OrbitChip key={chip.label} chip={chip} />
      ))}

      {/* the mood blob itself */}
      <motion.div
        className="relative grid place-items-center animate-breathe"
        style={{ width: 176, height: 176 }}
        animate={{
          borderRadius: [
            "42% 58% 65% 35% / 45% 40% 60% 55%",
            "58% 42% 40% 60% / 55% 60% 40% 45%",
            "42% 58% 65% 35% / 45% 40% 60% 55%",
          ],
        }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-grad-ember shadow-ember-lg"
          animate={{
            borderRadius: [
              "42% 58% 65% 35% / 45% 40% 60% 55%",
              "58% 42% 40% 60% / 55% 60% 40% 45%",
              "42% 58% 65% 35% / 45% 40% 60% 55%",
            ],
          }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
        />

        {/* blush cheeks */}
        <span
          className="absolute h-6 w-8 rounded-full bg-rose-400/50 blur-[6px]"
          style={{ left: "16%", top: "58%" }}
          aria-hidden="true"
        />
        <span
          className="absolute h-6 w-8 rounded-full bg-rose-400/50 blur-[6px]"
          style={{ right: "16%", top: "58%" }}
          aria-hidden="true"
        />

        {/* eyes */}
        <div className="absolute flex items-center gap-6" style={{ top: "40%" }}>
          <span className="block h-6 w-3 rounded-full bg-ink-950/85 animate-blink" style={{ transformOrigin: "center" }} />
          <span
            className="block h-6 w-3 rounded-full bg-ink-950/85 animate-blink"
            style={{ transformOrigin: "center", animationDelay: "0.08s" }}
          />
        </div>

        {/* smile */}
        <svg
          className="absolute"
          style={{ top: "58%" }}
          width="46"
          height="20"
          viewBox="0 0 46 20"
          fill="none"
        >
          <path
            d="M3 4C7 14 39 14 43 4"
            stroke="rgba(12,10,8,0.85)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}
