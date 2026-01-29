"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/src/components/AppShell";
import EntryForm, { type EntryFormValues } from "@/src/components/EntryForm";
import Modal from "@/src/components/Modal";
import ProgressBar from "@/src/components/ProgressBar";
import StatCard from "@/src/components/StatCard";
import { db, type Entry, useEntriesForDay, useProfile } from "@/src/db";
import { formatNumber } from "@/src/lib/calculations";
import { getLocalDayKey } from "@/src/lib/date";
import { useI18n } from "@/src/i18n/LanguageProvider";

const buildDefaultEntry = (): EntryFormValues => ({
  calories: 0,
  createdAt: new Date().toISOString(),
});

const EMPTY_ENTRIES: Entry[] = [];

export default function TodayPage() {
  const router = useRouter();
  const profile = useProfile();
  const dayKey = getLocalDayKey(new Date());
  const entries = useEntriesForDay(dayKey);
  const entriesList = entries ?? EMPTY_ENTRIES;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const { t, locale } = useI18n();

  const totals = useMemo(() => {
    const totalCalories = entriesList.reduce((sum, entry) => sum + entry.calories, 0);
    const macros = entriesList.reduce(
      (sum, entry) => {
        sum.protein += entry.protein ?? 0;
        sum.carbs += entry.carbs ?? 0;
        sum.fat += entry.fat ?? 0;
        return sum;
      },
      { protein: 0, carbs: 0, fat: 0 },
    );
    return { totalCalories, macros };
  }, [entriesList]);

  useEffect(() => {
    if (profile === null) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">{t("today.loading")}</p>
      </div>
    );
  }

  const remaining = profile.targetCalories - totals.totalCalories;
  const progress = (totals.totalCalories / profile.targetCalories) * 100;
  const tdeeDelta = totals.totalCalories - profile.tdee;

  const handleSave = async (values: EntryFormValues) => {
    const entryDayKey = getLocalDayKey(new Date(values.createdAt));
    const payload: Entry = {
      ...values,
      dayKey: entryDayKey,
    };

    if (editing?.id) {
      await db.entries.update(editing.id, payload);
    } else {
      await db.entries.add(payload);
    }
    setOpen(false);
    setEditing(null);
  };

  return (
    <AppShell
      title={t("today.title")}
      action={
        <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300">
          {dayKey}
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {t("today.dailyTarget")}
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatNumber(profile.targetCalories, locale)} kcal
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {t("today.consumed")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatNumber(totals.totalCalories, locale)} kcal
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={progress} />
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>
                  {t("today.remaining")}: {formatNumber(remaining, locale)} kcal
                </span>
                <span>
                  {tdeeDelta >= 0 ? t("today.surplus") : t("today.deficit")}:{" "}
                  {t("today.vsTdee", {
                    amount: formatNumber(Math.abs(tdeeDelta), locale),
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label={t("today.macros.protein")}
              value={`${formatNumber(totals.macros.protein, locale)} g`}
            />
            <StatCard
              label={t("today.macros.carbs")}
              value={`${formatNumber(totals.macros.carbs, locale)} g`}
            />
            <StatCard
              label={t("today.macros.fat")}
              value={`${formatNumber(totals.macros.fat, locale)} g`}
            />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">
                {t("today.entries.title")}
              </h2>
              <button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="hidden rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 sm:inline-block"
              >
                {t("common.addEntry")}
              </button>
            </div>
            <div className="divide-y divide-slate-800">
              {entriesList.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-400">
                  {t("today.entries.empty")}
                </div>
              ) : (
                [...entriesList]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {entry.label ?? t("today.entries.untitled")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(entry.createdAt).toLocaleTimeString(locale, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-slate-200">
                          {formatNumber(entry.calories, locale)} kcal
                        </p>
                        <button
                          onClick={() => {
                            setEditing(entry);
                            setOpen(true);
                          }}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          onClick={async () => {
                            if (entry.id) {
                              await db.entries.delete(entry.id);
                            }
                          }}
                          className="rounded-full border border-rose-500/60 px-3 py-1 text-xs text-rose-200"
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <StatCard label="BMR" value={`${formatNumber(profile.bmr, locale)} kcal`} />
          <StatCard label="TDEE" value={`${formatNumber(profile.tdee, locale)} kcal`} />
          <StatCard
            label={t("common.target")}
            value={`${formatNumber(profile.targetCalories, locale)} kcal`}
          />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-400">
            {t("today.sidebar.note")}
          </div>
        </aside>
      </div>

      <button
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        className="fixed bottom-20 right-4 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg sm:hidden"
      >
        {t("common.addEntry")}
      </button>

      <Modal
        open={open}
        title={editing ? t("today.modal.editTitle") : t("today.modal.addTitle")}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      >
        <EntryForm
          initialValues={
            editing
              ? {
                  label: editing.label,
                  calories: editing.calories,
                  protein: editing.protein,
                  carbs: editing.carbs,
                  fat: editing.fat,
                  createdAt: editing.createdAt,
                }
              : buildDefaultEntry()
          }
          onCancel={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSave}
        />
      </Modal>
    </AppShell>
  );
}
