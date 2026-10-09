"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Sparkles } from "lucide-react";
import { sfx } from "@/lib/sfx";
import { useLanguage } from "@/components/LanguageProvider";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/scan", label: "Scan Mood" },
  { href: "/avatar", label: "Avatar" },
  { href: "/gallery", label: "Galeri" },
];

export default function Navbar() {
  const { locale, t, changeLanguage } = useLanguage();
  const pathname = usePathname();
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current);
  }, []);

  function toggleTheme() {
    sfx.toggle();
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("emora-theme", next);
    } catch {}
  }

  return (
    <header className="sticky top-0 z-40 surface-glass">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            onMouseEnter={sfx.hover}
            onClick={sfx.click}
            className="flex items-center gap-1.5 focus-ring group"
          >
            <span className="font-display italic text-[1.6rem] leading-none gradient-text">
              Emora
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1 relative">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={sfx.hover}
                  onClick={sfx.click}
                  className={`focus-ring relative px-3.5 py-2 text-[0.9rem] rounded-full transition-colors z-10 ${
                    active ? "font-semibold text-ink-950 dark:text-ink-950" : "text-soft hover:text-inherit"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-ember-400 to-rose-500 -z-10"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className={active ? "relative" : "relative link-underline"}>
                    {t(link.label)}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/scan"
              onMouseEnter={sfx.hover}
              onClick={sfx.click}
              className="btn-primary hidden sm:inline-flex !py-2.5 !px-5 text-[0.875rem]"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
              {t("Scan sekarang")}
            </Link>
            <button
              type="button"
              onClick={() => { sfx.toggle(); changeLanguage(locale === "id" ? "en" : "id"); }}
              onMouseEnter={sfx.hover}
              aria-label={locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
              title={t("Bahasa")}
              className="focus-ring rounded-full border hairline px-2.5 py-1.5 text-xs font-semibold text-soft hover:text-inherit"
            >
              {locale === "id" ? "EN" : "ID"}
            </button>
            <button
              onClick={toggleTheme}
              onMouseEnter={sfx.hover}
              aria-label={t("Ganti tema terang/gelap")}
              className="btn-ghost-icon focus-ring h-9 w-9 border hairline"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -50, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 50, scale: 0.6 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="grid place-items-center"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" strokeWidth={1.8} />
                  ) : (
                    <Moon className="h-4 w-4" strokeWidth={1.8} />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <nav className="flex sm:hidden items-center gap-1 pb-3 -mt-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={sfx.hover}
                onClick={sfx.click}
                className={`focus-ring relative px-3 py-1.5 text-[0.85rem] rounded-full whitespace-nowrap ${
                  active ? "font-semibold text-ink-950" : "text-soft"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill-mobile"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-ember-400 to-rose-500 -z-10"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{t(link.label)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
