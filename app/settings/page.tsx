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
  const [deficitForm, setDeficitForm] = useState(() => ({
    goalKg: "",
    kcalPerKg: "",
    useChange: false,
    targetBefore: "",
    targetAfter: "",
    changeDay: "",
  }));

  useEffect(() => {
    if (profile === null) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  useEffect(() => {
    if (!profile) return;
    setDeficitForm({
      goalKg: String(profile.deficitGoalKg ?? 10),
      kcalPerKg: String(profile.deficitKcalPerKg ?? 7700),
      useChange: Boolean(profile.deficitUseTargetChange ?? false),
      targetBefore: String(profile.deficitTargetBefore ?? profile.targetCalories),
      targetAfter: String(profile.deficitTargetAfter ?? profile.targetCalories),
      changeDay: String(profile.deficitChangeDay ?? 43),
    });
  }, [profile]);

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

  const handleSaveDeficitSettings = async () => {
    const next: Profile = {
      ...profile,
      deficitGoalKg: Number(deficitForm.goalKg) || 10,
      deficitKcalPerKg: Number(deficitForm.kcalPerKg) || 7700,
      deficitUseTargetChange: Boolean(deficitForm.useChange),
      deficitTargetBefore: Number(deficitForm.targetBefore) || profile.targetCalories,
      deficitTargetAfter: Number(deficitForm.targetAfter) || profile.targetCalories,
      deficitChangeDay: Math.max(1, Number(deficitForm.changeDay) || 43),
      updatedAt: new Date().toISOString(),
    };
    await db.profile.put({ ...next, id: PROFILE_ID });
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
                // Preserve deficit settings when updating profile.
                await db.profile.put({
                  ...nextProfile,
                  id: PROFILE_ID,
                  deficitGoalKg: profile.deficitGoalKg,
                  deficitKcalPerKg: profile.deficitKcalPerKg,
                  deficitUseTargetChange: profile.deficitUseTargetChange,
                  deficitTargetBefore: profile.deficitTargetBefore,
                  deficitTargetAfter: profile.deficitTargetAfter,
                  deficitChangeDay: profile.deficitChangeDay,
                });
              }}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold text-white">Deficit tracking</h2>
          <p className="text-sm text-slate-400">
            Configure your target calories and goal to estimate weight loss.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Goal weight loss (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={deficitForm.goalKg}
                onChange={(e) => setDeficitForm((p) => ({ ...p, goalKg: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                kcal per 1 kg
              </label>
              <input
                type="number"
                min="1000"
                step="100"
                value={deficitForm.kcalPerKg}
                onChange={(e) => setDeficitForm((p) => ({ ...p, kcalPerKg: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
              />
              <p className="mt-2 text-xs text-slate-500">Default is 7700 kcal/kg.</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <input
              id="use-change"
              type="checkbox"
              checked={deficitForm.useChange}
              onChange={(e) => setDeficitForm((p) => ({ ...p, useChange: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-950"
            />
            <label htmlFor="use-change" className="text-sm text-slate-300">
              Use a target change day (before/after targets)
            </label>
          </div>

          {deficitForm.useChange ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Target before (kcal)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deficitForm.targetBefore}
                  onChange={(e) => setDeficitForm((p) => ({ ...p, targetBefore: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Target after (kcal)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deficitForm.targetAfter}
                  onChange={(e) => setDeficitForm((p) => ({ ...p, targetAfter: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Change on day #
                </label>
                <input
                  type="number"
                  min="1"
                  value={deficitForm.changeDay}
                  onChange={(e) => setDeficitForm((p) => ({ ...p, changeDay: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Daily target (kcal)
              </label>
              <input
                type="number"
                min="0"
                value={deficitForm.targetAfter}
                onChange={(e) =>
                  setDeficitForm((p) => ({
                    ...p,
                    targetAfter: e.target.value,
                    targetBefore: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
              />
              <p className="mt-2 text-xs text-slate-500">
                If you leave this, we’ll use your onboarding target.
              </p>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSaveDeficitSettings}
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950"
            >
              Save deficit settings
            </button>
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
