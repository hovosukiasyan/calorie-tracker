"use client";

import { useState } from "react";
import type { ActivityLevel, Goal, Profile, Sex } from "@/src/db";
import { buildProfile } from "@/src/lib/calculations";
import { profileSchema } from "@/src/lib/validation";

const activityOptions: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very-active", label: "Very Active" },
];

const goalOptions: { value: Goal; label: string }[] = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Gain weight" },
];

const paceOptions = [0.25, 0.5, 0.75, 1];

const steps = ["Basics", "Activity", "Goal"] as const;

export default function OnboardingWizard({
  onComplete,
  initialValues,
}: {
  onComplete: (profile: Profile) => void;
  initialValues?: Profile;
}) {
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
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
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
      setError("Please double-check your inputs.");
      return;
    }

    setError(null);
    onComplete(buildProfile(result.data));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {steps[stepIndex]}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Let’s tailor your calorie targets to fit your goals. You can update this later
          from settings.
        </p>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {stepIndex === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sex
            </label>
            <select
              value={form.sex}
              onChange={(event) => update("sex", event.target.value as Sex)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Age
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
              Height (cm)
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
              Weight (kg)
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
              Activity level
            </label>
            <select
              value={form.activityLevel}
              onChange={(event) =>
                update("activityLevel", event.target.value as ActivityLevel)
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            >
              {activityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400">
              This helps estimate how many calories you burn on an average day.
            </p>
          </div>
        </div>
      ) : null}

      {stepIndex === 2 ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Goal
            </label>
            <select
              value={form.goal}
              onChange={(event) => update("goal", event.target.value as Goal)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            >
              {goalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Weekly pace
            </label>
            <select
              value={form.pace}
              onChange={(event) => update("pace", Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
            >
              {paceOptions.map((pace) => (
                <option key={pace} value={pace}>
                  {form.goal === "gain"
                    ? "Gain"
                    : form.goal === "lose"
                      ? "Lose"
                      : "Maintain"}{" "}
                  {pace} kg/week
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400">
              We’ll translate this into a daily calorie adjustment.
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
          Back
        </button>
        {stepIndex < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950"
          >
            Save Profile
          </button>
        )}
      </div>
    </div>
  );
}
