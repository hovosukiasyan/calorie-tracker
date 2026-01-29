"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import type { I18nKey, Lang } from "./translations";
import { translations } from "./translations";

const STORAGE_KEY = "calorie_tracker_lang";

type I18nContextValue = {
  lang: Lang;
  locale: string;
  setLang: (lang: Lang) => void;
  t: (key: I18nKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const interpolate = (template: string, params?: Record<string, string | number>) => {
  if (!params) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? "" : String(value);
  });
};

const normalizeLang = (value: unknown): Lang | null => {
  if (value === "en" || value === "ru") return value;
  return null;
};

const detectDefaultLang = (): Lang => {
  if (typeof navigator === "undefined") return "en";
  const nav = (navigator.language || "").toLowerCase();
  if (nav.startsWith("ru")) return "ru";
  return "en";
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = normalizeLang(window.localStorage.getItem(STORAGE_KEY));
    setLangState(stored ?? detectDefaultLang());
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const locale = lang === "ru" ? "ru-RU" : "en-US";
    const dict = translations[lang];

    return {
      lang,
      locale,
      setLang,
      t: (key, params) => interpolate(dict[key], params),
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <LanguageProvider />");
  }
  return ctx;
}

