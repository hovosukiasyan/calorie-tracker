import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Calorie Tracker",
  description: "Track calories offline with a privacy-first PWA.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
            <nav className="flex items-center justify-between px-4 py-3">
              <Link href="/today" className="text-lg font-semibold text-slate-900">
                Calorie Tracker
              </Link>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <Link href="/today" className="hover:text-slate-900">
                  Today
                </Link>
                <Link href="/history" className="hover:text-slate-900">
                  History
                </Link>
                <Link href="/analytics" className="hover:text-slate-900">
                  Analytics
                </Link>
                <Link href="/settings" className="hover:text-slate-900">
                  Settings
                </Link>
              </div>
            </nav>
          </header>
          <main className="flex-1 px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
