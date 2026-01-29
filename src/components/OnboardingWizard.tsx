"use client";

import { useState } from "react";
import type { ActivityLevel, Goal, Profile, Sex } from "@/src/db";
import { buildProfile } from "@/src/lib/calculations";
import { profileSchema } from "@/src/lib/validation";
import { useI18n } from "@/src/i18n/LanguageProvider";

const paceOptions = [0.25, 0.5, 0.75, 1];

export default function OnboardingWizard({
  onComplete,
  initialValues,
}: {
  onComplete: (profile: Profile) => void;
  initialValues?: Profile;
}) {
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    sex: (initialValues?.sex ?? "female") as Sex,
    age: initialValues?.age ?? 30,
    heightCm: initialValues?.heightCm ?? 165,
    weightKg: initialValues?.weightKg ?? 70,
    activityLevel: initialValues?.activityLevel ?? "moderate",
    goal: initialValues?.goal ?? "maintain",
    pace: initialValues?.pace ?? 0.5,
  }));

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    setStepIndex((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    const result = profileSchema.safeParse({
      ...form,
      age: Number(form.age),
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      pace: Number(form.pace),
    });

    if (!result.success) {
      setError(t("onboarding.error.invalidProfile"));
      return;
    }

    setError(null);
    onComplete(buildProfile(result.data));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {t("onboarding.stepOf", { current: stepIndex + 1, total: 3 })}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {stepIndex === 0
            ? t("onboarding.steps.basics")
            : stepIndex === 1
              ? t("onboarding.steps.activity")
              : t("onboarding.steps.goal")}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {t("onboarding.subtitle")}
        </p>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {stepIndex === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("onboarding.labels.sex")}
            </label>
            <select
              value={form.sex}
              onChange={(event) => update("sex", event.target.value as Sex)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            >
              <option value="female">{t("onboarding.sex.female")}</option>
              <option value="male">{t("onboarding.sex.male")}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("onboarding.labels.age")}
            </label>
            <input
              type="number"
              min="13"
              value={form.age}
              onChange={(event) => update("age", Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("onboarding.labels.heightCm")}
            </label>
            <input
              type="number"
              min="120"
              value={form.heightCm}
              onChange={(event) => update("heightCm", Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("onboarding.labels.weightKg")}
            </label>
            <input
              type="number"
              min="30"
              value={form.weightKg}
              onChange={(event) => update("weightKg", Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            />
          </div>
        </div>
      ) : null}

      {stepIndex === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("onboarding.labels.activityLevel")}
            </label>
            <select
              value={form.activityLevel}
              onChange={(event) =>
                update("activityLevel", event.target.value as ActivityLevel)
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            >
              <option value="sedentary">{t("onboarding.activity.sedentary")}</option>
              <option value="light">{t("onboarding.activity.light")}</option>
              <option value="moderate">{t("onboarding.activity.moderate")}</option>
              <option value="active">{t("onboarding.activity.active")}</option>
              <option value="very-active">{t("onboarding.activity.veryActive")}</option>
            </select>
            <p className="mt-2 text-xs text-slate-400">
              {t("onboarding.help.activityLevel")}
            </p>
          </div>
        </div>
      ) : null}

      {stepIndex === 2 ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("onboarding.labels.goal")}
            </label>
            <select
              value={form.goal}
              onChange={(event) => update("goal", event.target.value as Goal)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            >
              <option value="lose">{t("onboarding.goal.lose")}</option>
              <option value="maintain">{t("onboarding.goal.maintain")}</option>
              <option value="gain">{t("onboarding.goal.gain")}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t("onboarding.labels.weeklyPace")}
            </label>
            <select
              value={form.pace}
              onChange={(event) => update("pace", Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            >
              {paceOptions.map((pace) => (
                <option key={pace} value={pace}>
                  {t("onboarding.pace.option", {
                    direction:
                      form.goal === "gain"
                        ? t("onboarding.pace.direction.gain")
                        : form.goal === "lose"
                          ? t("onboarding.pace.direction.lose")
                          : t("onboarding.pace.direction.maintain"),
                    pace,
                  })}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400">
              {t("onboarding.help.weeklyPace")}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
        >
          {t("onboarding.buttons.back")}
        </button>
        {stepIndex < 2 ? (
          <button
            onClick={handleNext}
            className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900"
          >
            {t("onboarding.buttons.continue")}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950"
          >
            {t("onboarding.buttons.saveProfile")}
          </button>
        )}
      </div>
    </div>
  );
}
