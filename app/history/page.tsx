"use client";

import { useMemo, useState } from "react";

import { Entry } from "@/src/db";
import { useEntriesSince, useProfile } from "@/src/db/hooks";
import { formatNumber } from "@/src/lib/calculations";
import { formatDayLabel, getDayKey, getStartDayKey } from "@/src/lib/dates";

const DAYS_TO_SHOW = 14;

const groupByDay = (entries: Entry[]) =>
  entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    acc[entry.dayKey] = acc[entry.dayKey] ?? [];
    acc[entry.dayKey].push(entry);
    return acc;
  }, {});

export default function HistoryPage() {
  const profile = useProfile();
  const startKey = getStartDayKey(DAYS_TO_SHOW);
  const entries = useEntriesSince(startKey);
  const grouped = useMemo(() => groupByDay(entries), [entries]);
  const days = useMemo(() => Object.keys(grouped).sort().reverse(), [grouped]);
  const [selectedDay, setSelectedDay] = useState(getDayKey());

  if (profile === undefined) return null;
  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Complete onboarding to start logging meals.
      </div>
    );
  }

  const selectedEntries = grouped[selectedDay] ?? [];
  const totals = selectedEntries.reduce(
    (acc, entry) => {
      acc.calories += entry.calories;
      return acc;
    },
    { calories: 0 },
  );

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Recent days</h2>
        <div className="space-y-2">
          {days.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
              No history yet.
            </div>
          ) : (
            days.map((dayKey) => {
              const dayTotal = grouped[dayKey].reduce((sum, entry) => sum + entry.calories, 0);
              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedDay(dayKey)}
                  className={`w-full rounded-xl border px-3 py-3 text-left text-sm ${
                    selectedDay === dayKey
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-medium text-slate-900">{formatDayLabel(dayKey)}</p>
                  <p className="text-xs text-slate-500">
                    {formatNumber(dayTotal)} calories
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{formatDayLabel(selectedDay)}</h2>
          <p className="text-sm text-slate-500">
            {formatNumber(totals.calories)} calories logged
          </p>
        </div>

        {selectedEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No entries for this day.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEntries.map((entry) => (
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
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatNumber(entry.calories)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
