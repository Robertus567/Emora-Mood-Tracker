/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#0C0A08",
          900: "#15120E",
          800: "#1E1A15",
          700: "#2A241C",
          600: "#3A3226",
        },
        paper: {
          100: "#FFFFFF",
          200: "#F7F2E9",
          300: "#EEE5D3",
        },
        ember: {
          50: "#FFF4E4",
          200: "#F6C98A",
          400: "#EA9F3D",
          500: "#E08A2B",
          600: "#C96E1F",
          700: "#9A4E17",
        },
        rose: {
          400: "#E06A82",
          500: "#D14F6E",
          600: "#B23A58",
        },
        violet: {
          400: "#8F7BC4",
          500: "#7560AC",
        },
        mood: {
          joy: "#E8A93B",
          calm: "#8593AE",
          sad: "#5B7BB0",
          anger: "#CC5238",
          fear: "#8570C2",
          disgust: "#5C9370",
          surprise: "#D1568F",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(0,0,0,0.5)",
        lift: "0 12px 32px -12px rgba(0,0,0,0.35)",
        ember: "0 8px 24px -8px rgba(224,138,43,0.45)",
        "ember-lg": "0 20px 48px -12px rgba(224,138,43,0.35)",
      },
      backgroundImage: {
        "grad-ember": "linear-gradient(135deg, #E9A544 0%, #E08A2B 45%, #D1568F 100%)",
        "grad-ember-soft": "linear-gradient(135deg, rgba(233,165,68,0.16) 0%, rgba(209,86,143,0.12) 100%)",
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.45 },
        },
        "rise-in": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        flash: {
          "0%": { opacity: 0.9 },
          "100%": { opacity: 0 },
        },
        "pop-in": {
          "0%": { opacity: 0, transform: "scale(0.85) translateY(8px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.035)" },
        },
        blink: {
          "0%, 92%, 100%": { transform: "scaleY(1)" },
          "96%": { transform: "scaleY(0.08)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%) skewX(-15deg)" },
          "100%": { transform: "translateX(220%) skewX(-15deg)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        sweep: "sweep 2.2s cubic-bezier(0.4,0,0.2,1) infinite",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "rise-in": "rise-in 0.6s cubic-bezier(0.16,1,0.3,1) both",
        flash: "flash 0.35s ease-out forwards",
        "pop-in": "pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        breathe: "breathe 4.5s ease-in-out infinite",
        blink: "blink 4.8s ease-in-out infinite",
        shimmer: "shimmer 2.8s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16,1,0.3,1)",
        "spring-bounce": "cubic-bezier(0.34,1.56,0.64,1)",
      },
    },
  },
  plugins: [],
};
