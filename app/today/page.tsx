"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { db, Entry } from "@/src/db";
import { useEntriesByDay, useProfile } from "@/src/db/hooks";
import { formatNumber } from "@/src/lib/calculations";
import { getDayKey } from "@/src/lib/dates";
import { EntryForm } from "@/src/components/EntryForm";
import { Modal } from "@/src/components/Modal";
import { ProgressBar } from "@/src/components/ProgressBar";
import { StatCard } from "@/src/components/StatCard";

export default function TodayPage() {
  const router = useRouter();
  const profile = useProfile();
  const todayKey = getDayKey();
  const entries = useEntriesByDay(todayKey);
  const [isOpen, setIsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  if (profile === undefined) {
    return null;
  }

  if (!profile) {
    router.replace("/onboarding");
    return null;
  }

  const totals = useMemo(() => {
    const calories = entries.reduce((sum, entry) => sum + entry.calories, 0);
    return {
      calories,
      remaining: profile.targetCalories - calories,
      target: profile.targetCalories,
      tdee: profile.tdee,
    };
  }, [entries, profile]);

  const handleSave = async (entry: Entry) => {
    const payload = {
      ...entry,
      dayKey: todayKey,
    };
    if (entry.id) {
      await db.entries.update(entry.id, payload);
    } else {
      await db.entries.add(payload);
    }
    setIsOpen(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setIsOpen(true);
  };

  const handleDelete = async (entry: Entry) => {
    if (!entry.id) return;
    await db.entries.delete(entry.id);
  };

  const progress = totals.calories / totals.target;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Target calories"
          value={formatNumber(totals.target)}
          helper={`TDEE ${formatNumber(totals.tdee)}`}
        />
        <StatCard
          label="Consumed today"
          value={formatNumber(totals.calories)}
          helper={`${formatNumber(totals.remaining)} remaining`}
        />
        <StatCard
          label="Deficit / Surplus"
          value={formatNumber(totals.calories - totals.tdee)}
          helper={`vs TDEE`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Daily progress</h2>
            <p className="text-sm text-slate-500">
              {formatNumber(totals.calories)} / {formatNumber(totals.target)} calories
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="mt-4">
          <ProgressBar value={progress * 100} />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Today’s log</h2>
          <button
            type="button"
            onClick={() => {
              setEditingEntry(null);
              setIsOpen(true);
            }}
            className="hidden rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white md:inline-flex"
          >
            Add entry
          </button>
        </div>
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No entries yet. Tap “Add entry” to log your first food today.
          </div>
        ) : (
          <div className="space-y-3">
            {entries
              .slice()
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {entry.label ?? "Food entry"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {entry.protein ? `${entry.protein}g protein · ` : ""}
                        {entry.carbs ? `${entry.carbs}g carbs · ` : ""}
                        {entry.fat ? `${entry.fat}g fat` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">
                        {formatNumber(entry.calories)}
                      </p>
                      <div className="mt-2 flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleEdit(entry)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => {
          setEditingEntry(null);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-lg md:hidden"
      >
        +
      </button>

      <Modal
        open={isOpen}
        title={editingEntry ? "Edit entry" : "Add entry"}
        onClose={() => {
          setIsOpen(false);
          setEditingEntry(null);
        }}
      >
        <EntryForm
          initial={editingEntry ?? undefined}
          onSave={handleSave}
          onCancel={() => {
            setIsOpen(false);
            setEditingEntry(null);
          }}
        />
      </Modal>
    </div>
  );
}
