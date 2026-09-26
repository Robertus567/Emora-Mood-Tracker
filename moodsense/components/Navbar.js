"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MoodRibbon from "./MoodRibbon";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/scan", label: "Scan Mood" },
  { href: "/history", label: "Riwayat" },
];

function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.6M12 18.9v2.6M4.6 12H2M22 12h-2.6M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar({ ticks }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("emora-theme", next);
    } catch {}
  }

  return (
    <header className="sticky top-0 z-40 surface backdrop-blur">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2 focus-ring">
            <span className="font-display italic text-[1.6rem] leading-none">Emora</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`focus-ring px-3.5 py-2 text-[0.9rem] rounded-full transition-colors ${
                    active ? "font-semibold" : "text-soft hover:text-inherit"
                  }`}
                  style={active ? { backgroundColor: "rgb(var(--bg-sunken))" } : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/scan" className="btn-primary hidden sm:inline-flex">
              Scan sekarang
            </Link>
            <button
              onClick={toggleTheme}
              aria-label="Ganti tema terang/gelap"
              className="focus-ring h-9 w-9 grid place-items-center rounded-full border hairline text-soft hover:text-inherit transition-colors"
            >
              {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="flex sm:hidden items-center gap-1 pb-3 -mt-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`focus-ring px-3 py-1.5 text-[0.85rem] rounded-full ${
                  active ? "font-semibold" : "text-soft"
                }`}
                style={active ? { backgroundColor: "rgb(var(--bg-sunken))" } : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <MoodRibbon ticks={ticks} />
    </header>
  );
}
