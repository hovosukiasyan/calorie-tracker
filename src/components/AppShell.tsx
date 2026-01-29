"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import LanguageSwitcher from "@/src/components/LanguageSwitcher";
import { useI18n } from "@/src/i18n/LanguageProvider";

export default function AppShell({
  children,
  title,
  action,
}: {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/today", label: t("nav.today") },
    { href: "/history", label: t("nav.history") },
    { href: "/analytics", label: t("nav.analytics") },
    { href: "/settings", label: t("nav.settings") },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {t("app.name")}
            </p>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {action}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
