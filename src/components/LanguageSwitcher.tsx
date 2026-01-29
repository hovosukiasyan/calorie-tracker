"use client";

import { useI18n } from "@/src/i18n/LanguageProvider";
import type { Lang } from "@/src/i18n/translations";

export default function LanguageSwitcher({
  size = "sm",
}: {
  size?: "sm" | "md";
}) {
  const { lang, setLang, t } = useI18n();

  const buttonClasses =
    size === "md"
      ? "rounded-full border px-4 py-2 text-sm"
      : "rounded-full border px-3 py-1 text-xs";

  const renderButton = (value: Lang, label: string) => {
    const active = lang === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => setLang(value)}
        className={`${buttonClasses} ${
          active
            ? "border-emerald-400 bg-emerald-400/10 text-white"
            : "border-slate-700 text-slate-300 hover:border-slate-500"
        }`}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{t("lang.label")}</span>
      {renderButton("en", t("lang.english"))}
      {renderButton("ru", t("lang.russian"))}
    </div>
  );
}

