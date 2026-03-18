"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { en, type Translation } from "./en";
import { ar } from "./ar";
import { tr } from "./tr";

export type Language = "en" | "ar" | "tr";

const translations: Record<Language, Translation> = {
  en,
  ar,
  tr,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem("arslan-language");
    if (saved && (saved === "en" || saved === "ar" || saved === "tr")) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("arslan-language", lang);
    
    // Update document direction for RTL (Arabic)
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    // Set initial direction
    if (mounted && typeof document !== "undefined") {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const ctx: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>;
}
