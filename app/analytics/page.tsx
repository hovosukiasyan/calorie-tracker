"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useMemo } from "react";

import { useEntriesSince, useProfile } from "@/src/db/hooks";
import { formatNumber } from "@/src/lib/calculations";
import { formatDayLabel, getDayKey, getStartDayKey } from "@/src/lib/dates";
import { StatCard } from "@/src/components/StatCard";

const DAYS_TO_SHOW = 30;

const buildDays = (days: number) => {
  const results: string[] = [];
  for (let index = 0; index < days; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    results.push(getDayKey(date));
  }
  return results.reverse();
};

export default function AnalyticsPage() {
  const profile = useProfile();
  const startKey = getStartDayKey(DAYS_TO_SHOW);
  const entries = useEntriesSince(startKey);

  const chartData = useMemo(() => {
    const days = buildDays(DAYS_TO_SHOW);
    const totals = new Map<string, number>();
    entries.forEach((entry) => {
      totals.set(entry.dayKey, (totals.get(entry.dayKey) ?? 0) + entry.calories);
    });

    const data = days.map((dayKey) => {
      const total = totals.get(dayKey) ?? 0;
      return {
        dayKey,
        label: formatDayLabel(dayKey),
        total,
      };
    });

    const rolling = data.map((item, index) => {
      const slice = data.slice(Math.max(0, index - 6), index + 1);
      const avg = slice.reduce((sum, entry) => sum + entry.total, 0) / slice.length;
      return {
        ...item,
        average: Math.round(avg),
      };
    });

    return rolling;
  }, [entries]);

  const last7 = chartData.slice(-7);
  const last14 = chartData.slice(-14);

  const stats = useMemo(() => {
    const totals = chartData.map((item) => item.total);
    const average = totals.length ? totals.reduce((sum, value) => sum + value, 0) / totals.length : 0;
    const nonZero = totals.filter((value) => value > 0);
    const best = nonZero.length ? Math.min(...nonZero) : 0;
    const highest = totals.length ? Math.max(...totals) : 0;
    const adherence = profile
      ? chartData.filter(
          (item) =>
            item.total > 0 &&
            Math.abs(item.total - profile.targetCalories) <= profile.targetCalories * 0.1,
        ).length
      : 0;
    return {
      average,
      best,
      highest,
      adherence,
    };
  }, [chartData, profile]);

  if (profile === undefined) return null;
  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Complete onboarding to unlock analytics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Average intake" value={formatNumber(Math.round(stats.average))} />
        <StatCard label="Best day" value={formatNumber(stats.best || 0)} />
        <StatCard label="Highest day" value={formatNumber(stats.highest)} />
        <StatCard
          label="Adherence"
          value={`${stats.adherence}/${chartData.length}`}
          helper="within ±10%"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Weekly intake vs target</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={last7.map((item) => ({
                  ...item,
                  target: profile ? profile.targetCalories : 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" />
                <Line type="monotone" dataKey="target" stroke="#0f172a" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">7-day rolling average</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#0f766e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Deficit / surplus (last 14 days)</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={last14.map((item) => ({
                ...item,
                delta: profile ? item.total - profile.targetCalories : 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="delta" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
