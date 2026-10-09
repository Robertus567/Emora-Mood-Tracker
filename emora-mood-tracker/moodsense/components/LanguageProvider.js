"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeLocale, translate } from "@/lib/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ initialLocale, children }) {
  const router = useRouter();
  const [locale, setLocale] = useState(normalizeLocale(initialLocale));

  useEffect(() => {
    setLocale(normalizeLocale(initialLocale));
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    t: (text) => translate(locale, text),
    changeLanguage(nextLocale) {
      const next = normalizeLocale(nextLocale);
      document.cookie = `emora-locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
      setLocale(next);
      router.refresh();
    },
  }), [locale, router]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
