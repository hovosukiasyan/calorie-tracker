"use client";

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

const buildDefaultEntry = (): EntryFormValues => ({
  calories: 0,
  createdAt: new Date().toISOString(),
});

export default function TodayPage() {
  const router = useRouter();
  const profile = useProfile();
  const dayKey = getLocalDayKey(new Date());
  const entries = useEntriesForDay(dayKey) ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);

  const totals = useMemo(() => {
    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
    const macros = entries.reduce(
      (sum, entry) => {
        sum.protein += entry.protein ?? 0;
        sum.carbs += entry.carbs ?? 0;
        sum.fat += entry.fat ?? 0;
        return sum;
      },
      { protein: 0, carbs: 0, fat: 0 },
    );
    return { totalCalories, macros };
  }, [entries]);

  useEffect(() => {
    if (profile === null) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">Loading profile…</p>
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
      title="Today"
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
                  Daily target
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatNumber(profile.targetCalories)} kcal
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Consumed
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatNumber(totals.totalCalories)} kcal
                </p>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={progress} />
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>Remaining: {formatNumber(remaining)} kcal</span>
                <span>
                  {tdeeDelta >= 0 ? "Surplus" : "Deficit"}: {formatNumber(Math.abs(tdeeDelta))} kcal vs TDEE
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Protein"
              value={`${formatNumber(totals.macros.protein)} g`}
            />
            <StatCard
              label="Carbs"
              value={`${formatNumber(totals.macros.carbs)} g`}
            />
            <StatCard label="Fat" value={`${formatNumber(totals.macros.fat)} g`} />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Today’s entries</h2>
              <button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="hidden rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 sm:inline-block"
              >
                Add Entry
              </button>
            </div>
            <div className="divide-y divide-slate-800">
              {entries.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-400">
                  No entries yet. Add your first meal or snack to get started.
                </div>
              ) : (
                [...entries]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {entry.label ?? "Untitled entry"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-slate-200">
                          {formatNumber(entry.calories)} kcal
                        </p>
                        <button
                          onClick={() => {
                            setEditing(entry);
                            setOpen(true);
                          }}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (entry.id) {
                              await db.entries.delete(entry.id);
                            }
                          }}
                          className="rounded-full border border-rose-500/60 px-3 py-1 text-xs text-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <StatCard label="BMR" value={`${formatNumber(profile.bmr)} kcal`} />
          <StatCard label="TDEE" value={`${formatNumber(profile.tdee)} kcal`} />
          <StatCard
            label="Target"
            value={`${formatNumber(profile.targetCalories)} kcal`}
          />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-400">
            Targets are based on your onboarding profile. Update them any time in
            Settings.
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
        Add Entry
      </button>

      <Modal
        open={open}
        title={editing ? "Edit entry" : "Add entry"}
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
