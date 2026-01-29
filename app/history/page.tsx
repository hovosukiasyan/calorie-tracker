"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/src/components/AppShell";
import EntryForm, { type EntryFormValues } from "@/src/components/EntryForm";
import Modal from "@/src/components/Modal";
import { db, type Entry, useEntriesBetweenDays, useProfile } from "@/src/db";
import { formatNumber } from "@/src/lib/calculations";
import { formatLongDate, getLocalDayKey, subtractDays } from "@/src/lib/date";
import { useI18n } from "@/src/i18n/LanguageProvider";

const RANGE_DAYS = 30;

const buildDefaultEntryForDay = (dayKey: string): EntryFormValues => ({
  calories: 0,
  createdAt: new Date(`${dayKey}T12:00:00`).toISOString(),
});

const EMPTY_ENTRIES: Entry[] = [];

export default function HistoryPage() {
  const router = useRouter();
  const profile = useProfile();
  const { t, locale } = useI18n();
  const todayKey = getLocalDayKey(new Date());
  const startKey = subtractDays(todayKey, RANGE_DAYS - 1);
  const entries = useEntriesBetweenDays(startKey, todayKey);
  const entriesList = entries ?? EMPTY_ENTRIES;
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);

  useEffect(() => {
    if (profile === null) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  const daySummaries = useMemo(() => {
    const map = new Map<string, number>();
    entriesList.forEach((entry) => {
      map.set(entry.dayKey, (map.get(entry.dayKey) ?? 0) + entry.calories);
    });
    return Array.from({ length: RANGE_DAYS }).map((_, index) => {
      const dayKey = subtractDays(todayKey, index);
      return {
        dayKey,
        total: map.get(dayKey) ?? 0,
      };
    });
  }, [entriesList, todayKey]);

  const selectedEntries = useMemo(
    () => entriesList.filter((entry) => entry.dayKey === selectedDay),
    [entriesList, selectedDay],
  );

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">{t("history.loading")}</p>
      </div>
    );
  }

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
    <AppShell title={t("history.title")}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("history.pastDays", { days: RANGE_DAYS })}
          </h2>
          <div className="space-y-2">
            {daySummaries.map((day) => (
              <button
                key={day.dayKey}
                onClick={() => setSelectedDay(day.dayKey)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selectedDay === day.dayKey
                    ? "border-emerald-400 bg-emerald-400/10 text-white"
                    : "border-slate-800 bg-slate-900/70 text-slate-300"
                }`}
              >
                <span>{formatLongDate(day.dayKey, locale)}</span>
                <span>{formatNumber(day.total, locale)} kcal</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {formatLongDate(selectedDay, locale)}
              </h3>
            <p className="text-xs text-slate-400">
                {t("common.target")}: {formatNumber(profile.targetCalories, locale)} kcal
            </p>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
            >
              {t("history.addForDay", { day: formatLongDate(selectedDay, locale) })}
            </button>
          </div>
          <div className="divide-y divide-slate-800">
            {selectedEntries.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">
                {t("history.entries.empty")}
              </p>
            ) : (
              selectedEntries
                .slice()
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {entry.label ?? t("history.entries.untitled")}
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
        </section>
      </div>

      <Modal
        open={open}
        title={editing ? t("history.modal.editTitle") : t("history.modal.addTitle")}
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
              : buildDefaultEntryForDay(selectedDay)
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
