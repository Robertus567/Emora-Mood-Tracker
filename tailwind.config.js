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
      },
      colors: {
        ink: {
          950: "#0B0E16",
          900: "#12151F",
          800: "#191D2A",
          700: "#232838",
          600: "#2E3448",
        },
        paper: {
          100: "#FFFFFF",
          200: "#F4F5F8",
          300: "#E7E9F0",
        },
        mood: {
          joy: "#E8A93B",
          calm: "#7A88A6",
          sad: "#4C6FA8",
          anger: "#C4432B",
          fear: "#7A63B8",
          disgust: "#4F8763",
          surprise: "#C94F92",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(0,0,0,0.5)",
        lift: "0 12px 32px -12px rgba(0,0,0,0.35)",
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
      },
      animation: {
        sweep: "sweep 2.2s cubic-bezier(0.4,0,0.2,1) infinite",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "rise-in": "rise-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        flash: "flash 0.35s ease-out forwards",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      },
    },
  },
  plugins: [],
};
