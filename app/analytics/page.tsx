"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";
import AppShell from "@/src/components/AppShell";
import StatCard from "@/src/components/StatCard";
import { useEntriesBetweenDays, useEntryDayBounds, useProfile } from "@/src/db";
import { formatNumber } from "@/src/lib/calculations";
import {
  diffDayKeys,
  enumerateDayKeys,
  formatDay,
  getISOWeekString,
  getLocalDayKey,
  getMonthRange,
  getWeekRange,
} from "@/src/lib/date";
import { useI18n } from "@/src/i18n/LanguageProvider";

const AnalyticsCharts = dynamicImport(() => import("./Charts"), {
  ssr: false,
});

const buildDaySeries = (dayKeys: string[], totals: Map<string, number>, locale: string) =>
  dayKeys.map((dayKey) => ({
    dayKey,
    label: formatDay(dayKey, locale),
    calories: totals.get(dayKey) ?? 0,
    hasEntries: totals.has(dayKey),
  }));

export default function AnalyticsPage() {
  const router = useRouter();
  const profile = useProfile();
  const bounds = useEntryDayBounds();
  const { t, locale } = useI18n();
  const todayKey = getLocalDayKey(new Date());
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");
  const [selectedMonth, setSelectedMonth] = useState(() => todayKey.slice(0, 7)); // YYYY-MM
  const [selectedWeek, setSelectedWeek] = useState(() => getISOWeekString(new Date())); // YYYY-Www

  const range = useMemo(() => {
    if (period === "all") {
      return {
        startDayKey: bounds.firstDayKey ?? todayKey,
        endDayKey: bounds.lastDayKey ?? todayKey,
      };
    }
    if (period === "week") return getWeekRange(selectedWeek);
    return getMonthRange(selectedMonth);
  }, [bounds.firstDayKey, bounds.lastDayKey, period, selectedMonth, selectedWeek, todayKey]);

  const startDayKey = bounds.firstDayKey
    ? (range.startDayKey < bounds.firstDayKey ? bounds.firstDayKey : range.startDayKey)
    : range.startDayKey;
  const endDayKey = range.endDayKey;

  const entries = useEntriesBetweenDays(startDayKey, endDayKey) ?? [];

  useEffect(() => {
    if (profile === null) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">{t("analytics.loading")}</p>
      </div>
    );
  }

  const totals = new Map<string, number>();
  entries.forEach((entry) => {
    totals.set(entry.dayKey, (totals.get(entry.dayKey) ?? 0) + entry.calories);
  });

  const dayKeys = enumerateDayKeys(startDayKey, endDayKey);
  const series = buildDaySeries(dayKeys, totals, locale);
  const trackedDays = series.filter((item) => item.hasEntries);

  const rolling = trackedDays.map((item, index) => {
    const slice = trackedDays.slice(Math.max(0, index - 6), index + 1);
    const avg = slice.reduce((sum, val) => sum + val.calories, 0) / slice.length;
    return { ...item, average: Math.round(avg) };
  });

  const totalCalories = trackedDays.reduce((sum, item) => sum + item.calories, 0);
  const average = trackedDays.length ? totalCalories / trackedDays.length : 0;
  const highestDay = trackedDays.length
    ? trackedDays.reduce((max, item) => (item.calories > max.calories ? item : max), trackedDays[0])
    : null;
  const bestDay = trackedDays.length
    ? trackedDays.reduce((best, item) => {
        const delta = Math.abs(item.calories - profile.targetCalories);
        const bestDelta = Math.abs(best.calories - profile.targetCalories);
        return delta < bestDelta ? item : best;
      }, trackedDays[0])
    : null;
  const adherenceDays = trackedDays.filter(
    (item) =>
      item.calories >= profile.targetCalories - 100 &&
      item.calories <= profile.targetCalories + 100,
  );

  const rangeLabel =
    period === "week"
      ? selectedWeek
      : period === "month"
        ? selectedMonth
        : t("analytics.period.all");

  // ---- Deficit tracking (based on daily totals) ----
  const trackingStartDayKey = bounds.firstDayKey ?? startDayKey;
  const deficitKcalPerKg = profile.deficitKcalPerKg ?? 7700;
  const deficitGoalKg = profile.deficitGoalKg ?? 10;
  const useTargetChange = Boolean(profile.deficitUseTargetChange);
  const targetBefore = profile.deficitTargetBefore ?? profile.targetCalories;
  const targetAfter = profile.deficitTargetAfter ?? profile.targetCalories;
  // Change day is "tracking day #" (starting from the first day you logged anything)
  const changeDay = Math.max(1, profile.deficitChangeDay ?? 43);

  const deficitSeries = trackedDays.map((item) => {
    const dayNumber = diffDayKeys(trackingStartDayKey, item.dayKey) + 1;
    const target = useTargetChange
      ? (dayNumber < changeDay ? targetBefore : targetAfter)
      : targetAfter;
    const deficit = target - item.calories;
    return { ...item, dayNumber, target, deficit };
  });

  let running = 0;
  const deficitCumulative = deficitSeries.map((item) => {
    running += item.deficit;
    return { ...item, totalDeficit: running };
  });

  const totalDeficit = deficitCumulative.length
    ? deficitCumulative[deficitCumulative.length - 1].totalDeficit
    : 0;
  const estimatedLossKg = totalDeficit / deficitKcalPerKg;
  const goalProgress = deficitGoalKg > 0 ? Math.min(estimatedLossKg / deficitGoalKg, 1) : 0;
  const averageDailyDeficit = deficitSeries.length
    ? deficitSeries.reduce((sum, d) => sum + d.deficit, 0) / deficitSeries.length
    : 0;

  return (
    <AppShell title={t("analytics.title")}>
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {t("analytics.period.label")}
            </p>
            <p className="mt-1 text-sm text-slate-300">{rangeLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "week" | "month" | "all")}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="week">{t("analytics.period.week")}</option>
              <option value="month">{t("analytics.period.month")}</option>
              <option value="all">{t("analytics.period.all")}</option>
            </select>

            {period === "week" ? (
              <div>
                <label className="sr-only">{t("analytics.period.selectWeek")}</label>
                <input
                  type="week"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </div>
            ) : null}

            {period === "month" ? (
              <div>
                <label className="sr-only">{t("analytics.period.selectMonth")}</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label={t("analytics.cards.avg30")}
          value={`${formatNumber(Math.round(average), locale)} kcal`}
        />
        <StatCard
          label={t("analytics.cards.bestDay")}
          value={`${formatNumber(bestDay?.calories ?? 0, locale)} kcal`}
          helper={bestDay ? formatDay(bestDay.dayKey, locale) : ""}
        />
        <StatCard
          label={t("analytics.cards.highestDay")}
          value={`${formatNumber(highestDay?.calories ?? 0, locale)} kcal`}
          helper={highestDay ? formatDay(highestDay.dayKey, locale) : ""}
        />
        <StatCard
          label={t("analytics.cards.adherence")}
          value={`${trackedDays.length ? Math.round((adherenceDays.length / trackedDays.length) * 100) : 0}%`}
          helper={t("analytics.cards.adherenceHelp")}
        />
      </div>

      <section className="mt-6 space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">Deficit progress</h2>
          <p className="text-xs text-slate-400">
            {useTargetChange
              ? `Target change on day ${changeDay} (before: ${targetBefore}, after: ${targetAfter})`
              : `Daily target: ${targetAfter}`}
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-4">
            <StatCard
              label="Total deficit"
              value={`${formatNumber(Math.round(totalDeficit), locale)} kcal`}
            />
            <StatCard
              label="Estimated loss"
              value={`${formatNumber(estimatedLossKg, locale, 2)} kg`}
            />
            <StatCard
              label="Goal progress"
              value={`${formatNumber(goalProgress * 100, locale, 1)}%`}
              helper={`Goal: ${formatNumber(deficitGoalKg, locale, 1)} kg`}
            />
            <StatCard
              label="Avg daily deficit"
              value={`${formatNumber(Math.round(averageDailyDeficit), locale)} kcal`}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Cumulative deficit ({rangeLabel})
              </h3>
              <AnalyticsCharts variant="deficitTotal" data={deficitCumulative} />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Daily deficit ({rangeLabel})
              </h3>
              <AnalyticsCharts variant="deficitDaily" data={deficitSeries} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">
            {t("analytics.sections.weeklyVsTarget")}
          </h2>
          <p className="text-xs text-slate-400">{rangeLabel}</p>
          <AnalyticsCharts
            variant="weekly"
            data={trackedDays}
            targetCalories={profile.targetCalories}
            targetLabel={t("analytics.chart.target")}
          />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">
            {t("analytics.sections.rollingAvg")}
          </h2>
          <p className="text-xs text-slate-400">{rangeLabel}</p>
          <AnalyticsCharts variant="rolling" data={rolling} />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">
            {t("analytics.sections.deficitSurplus")}
          </h2>
          <p className="text-xs text-slate-400">{rangeLabel}</p>
          <AnalyticsCharts
            variant="delta"
            data={trackedDays}
            targetCalories={profile.targetCalories}
            deltaLabel={t("analytics.chart.delta")}
          />
        </div>
      </section>
    </AppShell>
  );
}
