"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/src/components/AppShell";
import Modal from "@/src/components/Modal";
import OnboardingWizard from "@/src/components/OnboardingWizard";
import { db, PROFILE_ID, type Entry, type Profile, useProfile } from "@/src/db";
import { useI18n } from "@/src/i18n/LanguageProvider";

const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function SettingsPage() {
  const router = useRouter();
  const profile = useProfile();
  const { t } = useI18n();
  const [resetOpen, setResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profile === null) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">{t("settings.loading")}</p>
      </div>
    );
  }

  const handleExport = async () => {
    const entries = await db.entries.toArray();
    downloadJson("calorie-tracker-export.json", {
      profile,
      entries,
    });
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as { profile?: Profile; entries?: Entry[] };
    if (parsed.profile) {
      await db.profile.put({ ...parsed.profile, id: PROFILE_ID });
    }
    if (parsed.entries) {
      await db.entries.clear();
      await db.entries.bulkAdd(parsed.entries);
    }
  };

  return (
    <AppShell title={t("settings.title")}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">{t("settings.profile.title")}</h2>
          <p className="text-sm text-slate-400">
            {t("settings.profile.subtitle")}
          </p>
          <div className="mt-6">
            <OnboardingWizard
              initialValues={profile}
              onComplete={async (nextProfile) => {
                await db.profile.put({ ...nextProfile, id: PROFILE_ID });
              }}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">{t("settings.data.title")}</h2>
          <p className="text-sm text-slate-400">
            {t("settings.data.subtitle")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
            >
              {t("settings.data.export")}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
            >
              {t("settings.data.import")}
            </button>
            <button
              onClick={() => setResetOpen(true)}
              className="rounded-full border border-rose-500/70 px-4 py-2 text-sm text-rose-200"
            >
              {t("settings.data.reset")}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) {
                  await handleImport(file);
                }
                event.target.value = "";
              }}
            />
          </div>
        </section>
      </div>

      <Modal
        open={resetOpen}
        title={t("settings.reset.title")}
        onClose={() => setResetOpen(false)}
      >
        <p className="text-sm text-slate-300">
          {t("settings.reset.body")}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setResetOpen(false)}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={async () => {
              await db.profile.clear();
              await db.entries.clear();
              setResetOpen(false);
            }}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
          >
            {t("settings.reset.confirm")}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
