"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "@/src/components/AppShell";
import StatCard from "@/src/components/StatCard";
import { useEntriesBetweenDays, useProfile } from "@/src/db";
import { formatNumber } from "@/src/lib/calculations";
import { addDays, formatDay, getLocalDayKey, subtractDays } from "@/src/lib/date";

const buildDaySeries = (startKey: string, days: number, totals: Map<string, number>) =>
  Array.from({ length: days }).map((_, index) => {
    const dayKey = addDays(startKey, index);
    return {
      dayKey,
      label: formatDay(dayKey),
      calories: totals.get(dayKey) ?? 0,
    };
  });

export default function AnalyticsPage() {
  const router = useRouter();
  const profile = useProfile();
  const todayKey = getLocalDayKey(new Date());
  const startKey = subtractDays(todayKey, 29);
  const entries = useEntriesBetweenDays(startKey, todayKey) ?? [];

  useEffect(() => {
    if (profile === null) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">Loading analytics…</p>
      </div>
    );
  }

  const totals = new Map<string, number>();
  entries.forEach((entry) => {
    totals.set(entry.dayKey, (totals.get(entry.dayKey) ?? 0) + entry.calories);
  });

  const last30 = buildDaySeries(startKey, 30, totals);
  const last14 = last30.slice(-14);
  const last7 = last30.slice(-7);

  const rolling = last30.map((item, index) => {
    const slice = last30.slice(Math.max(0, index - 6), index + 1);
    const avg = slice.reduce((sum, val) => sum + val.calories, 0) / slice.length;
    return { ...item, average: Math.round(avg) };
  });

  const totalCalories = last30.reduce((sum, item) => sum + item.calories, 0);
  const average = totalCalories / last30.length;
  const highestDay = last30.reduce((max, item) => (item.calories > max.calories ? item : max), last30[0]);
  const bestDay = last30.reduce((best, item) => {
    const delta = Math.abs(item.calories - profile.targetCalories);
    const bestDelta = Math.abs(best.calories - profile.targetCalories);
    return delta < bestDelta ? item : best;
  }, last30[0]);
  const adherenceDays = last30.filter(
    (item) =>
      item.calories >= profile.targetCalories - 100 &&
      item.calories <= profile.targetCalories + 100,
  );

  return (
    <AppShell title="Analytics">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="30-day average" value={`${formatNumber(Math.round(average))} kcal`} />
        <StatCard
          label="Best day"
          value={`${formatNumber(bestDay.calories)} kcal`}
          helper={formatDay(bestDay.dayKey)}
        />
        <StatCard
          label="Highest day"
          value={`${formatNumber(highestDay.calories)} kcal`}
          helper={formatDay(highestDay.dayKey)}
        />
        <StatCard
          label="Adherence"
          value={`${Math.round((adherenceDays.length / last30.length) * 100)}%`}
          helper="Days within +/- 100 kcal"
        />
      </div>

      <section className="mt-6 space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">Weekly intake vs target</h2>
          <p className="text-xs text-slate-400">Last 7 days</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Legend />
                <Line type="monotone" dataKey="calories" stroke="#34d399" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey={() => profile.targetCalories}
                  name="Target"
                  stroke="#f97316"
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">Rolling 7-day average</h2>
          <p className="text-xs text-slate-400">Last 30 days</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rolling}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#38bdf8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">Deficit / surplus</h2>
          <p className="text-xs text-slate-400">Last 14 days vs target</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={last14.map((item) => ({
                  ...item,
                  delta: item.calories - profile.targetCalories,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Legend />
                <Bar dataKey="delta" fill="#f97316" name="Delta" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
