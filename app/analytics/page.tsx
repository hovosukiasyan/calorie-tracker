"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";
import AppShell from "@/src/components/AppShell";
import StatCard from "@/src/components/StatCard";
import { useEntriesBetweenDays, useProfile } from "@/src/db";
import { formatNumber } from "@/src/lib/calculations";
import { addDays, formatDay, getLocalDayKey, subtractDays } from "@/src/lib/date";
import { useI18n } from "@/src/i18n/LanguageProvider";

const AnalyticsCharts = dynamicImport(() => import("./Charts"), {
  ssr: false,
});

const buildDaySeries = (
  startKey: string,
  days: number,
  totals: Map<string, number>,
  locale: string,
) =>
  Array.from({ length: days }).map((_, index) => {
    const dayKey = addDays(startKey, index);
    return {
      dayKey,
      label: formatDay(dayKey, locale),
      calories: totals.get(dayKey) ?? 0,
    };
  });

export default function AnalyticsPage() {
  const router = useRouter();
  const profile = useProfile();
  const { t, locale } = useI18n();
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
        <p className="text-sm text-slate-400">{t("analytics.loading")}</p>
      </div>
    );
  }

  const totals = new Map<string, number>();
  entries.forEach((entry) => {
    totals.set(entry.dayKey, (totals.get(entry.dayKey) ?? 0) + entry.calories);
  });

  const last30 = buildDaySeries(startKey, 30, totals, locale);
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
    <AppShell title={t("analytics.title")}>
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label={t("analytics.cards.avg30")}
          value={`${formatNumber(Math.round(average), locale)} kcal`}
        />
        <StatCard
          label={t("analytics.cards.bestDay")}
          value={`${formatNumber(bestDay.calories, locale)} kcal`}
          helper={formatDay(bestDay.dayKey, locale)}
        />
        <StatCard
          label={t("analytics.cards.highestDay")}
          value={`${formatNumber(highestDay.calories, locale)} kcal`}
          helper={formatDay(highestDay.dayKey, locale)}
        />
        <StatCard
          label={t("analytics.cards.adherence")}
          value={`${Math.round((adherenceDays.length / last30.length) * 100)}%`}
          helper={t("analytics.cards.adherenceHelp")}
        />
      </div>

      <section className="mt-6 space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">
            {t("analytics.sections.weeklyVsTarget")}
          </h2>
          <p className="text-xs text-slate-400">{t("analytics.sections.last7Days")}</p>
          <AnalyticsCharts
            variant="weekly"
            data={last7}
            targetCalories={profile.targetCalories}
            targetLabel={t("analytics.chart.target")}
          />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">
            {t("analytics.sections.rollingAvg")}
          </h2>
          <p className="text-xs text-slate-400">{t("analytics.sections.last30Days")}</p>
          <AnalyticsCharts variant="rolling" data={rolling} />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-lg font-semibold text-white">
            {t("analytics.sections.deficitSurplus")}
          </h2>
          <p className="text-xs text-slate-400">{t("analytics.sections.last14Days")}</p>
          <AnalyticsCharts
            variant="delta"
            data={last14}
            targetCalories={profile.targetCalories}
            deltaLabel={t("analytics.chart.delta")}
          />
        </div>
      </section>
    </AppShell>
  );
}
