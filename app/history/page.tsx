"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/src/components/AppShell";
import { useEntriesBetweenDays, useProfile } from "@/src/db";
import { formatNumber } from "@/src/lib/calculations";
import { formatLongDate, getLocalDayKey, subtractDays } from "@/src/lib/date";

const RANGE_DAYS = 30;

export default function HistoryPage() {
  const router = useRouter();
  const profile = useProfile();
  const todayKey = getLocalDayKey(new Date());
  const startKey = subtractDays(todayKey, RANGE_DAYS - 1);
  const entries = useEntriesBetweenDays(startKey, todayKey) ?? [];
  const [selectedDay, setSelectedDay] = useState(todayKey);

  useEffect(() => {
    if (profile === null) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  const daySummaries = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((entry) => {
      map.set(entry.dayKey, (map.get(entry.dayKey) ?? 0) + entry.calories);
    });
    return Array.from({ length: RANGE_DAYS }).map((_, index) => {
      const dayKey = subtractDays(todayKey, index);
      return {
        dayKey,
        total: map.get(dayKey) ?? 0,
      };
    });
  }, [entries, todayKey]);

  const selectedEntries = useMemo(
    () => entries.filter((entry) => entry.dayKey === selectedDay),
    [entries, selectedDay],
  );

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">Loading history…</p>
      </div>
    );
  }

  return (
    <AppShell title="History">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Past {RANGE_DAYS} days
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
                <span>{formatLongDate(day.dayKey)}</span>
                <span>{formatNumber(day.total)} kcal</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-5 py-4">
            <h3 className="text-lg font-semibold text-white">
              {formatLongDate(selectedDay)}
            </h3>
            <p className="text-xs text-slate-400">
              Target: {formatNumber(profile.targetCalories)} kcal
            </p>
          </div>
          <div className="divide-y divide-slate-800">
            {selectedEntries.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">
                No entries logged for this day.
              </p>
            ) : (
              selectedEntries
                .slice()
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
                    <p className="text-sm text-slate-200">
                      {formatNumber(entry.calories)} kcal
                    </p>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
