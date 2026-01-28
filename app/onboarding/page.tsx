"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { db, Profile } from "@/src/db";
import { calculateBmr, calculateTargetCalories, calculateTdee, formatNumber } from "@/src/lib/calculations";

const steps = [
  "Basics",
  "Body",
  "Lifestyle",
  "Goal",
  "Summary",
];

const paceOptions = [0.25, 0.5, 0.75];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sex, setSex] = useState<"male" | "female">("female");
  const [age, setAge] = useState(30);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<Profile["activityLevel"]>("moderate");
  const [goal, setGoal] = useState<Profile["goal"]>("maintain");
  const [pace, setPace] = useState(0.5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bmr = useMemo(
    () => calculateBmr({ sex, age, heightCm, weightKg }),
    [sex, age, heightCm, weightKg],
  );
  const tdee = useMemo(() => calculateTdee(bmr, activityLevel), [bmr, activityLevel]);
  const targetCalories = useMemo(
    () => calculateTargetCalories(tdee, goal, pace),
    [tdee, goal, pace],
  );

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    const profile: Profile = {
      id: "profile",
      sex,
      age,
      heightCm,
      weightKg,
      activityLevel,
      goal,
      pace,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      createdAt: now,
      updatedAt: now,
    };
    await db.profile.put(profile);
    router.replace("/today");
  };

  if (!mounted) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#475569" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6" style={{ minHeight: "200px" }}>
      <div>
        <p className="text-sm uppercase tracking-widest text-emerald-500">Welcome</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Let’s set up your calorie plan
        </h1>
        <p className="mt-2 text-slate-600">
          We’ll calculate your daily target based on your body metrics and goals.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 ${
              index === step
                ? "bg-emerald-500 text-white"
                : "bg-white border border-slate-200"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="text-sm font-medium text-slate-700">Sex</label>
            <div className="mt-2 flex gap-3">
              {(["female", "male"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSex(value)}
                  className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium ${
                    sex === value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Age</label>
            <input
              type="number"
              min={12}
              value={age}
              onChange={(event) => setAge(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="text-sm font-medium text-slate-700">Height (cm)</label>
            <input
              type="number"
              min={120}
              value={heightCm}
              onChange={(event) => setHeightCm(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Weight (kg)</label>
            <input
              type="number"
              min={30}
              value={weightKg}
              onChange={(event) => setWeightKg(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-sm font-medium text-slate-700">Activity level</label>
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                { value: "sedentary", label: "Sedentary" },
                { value: "light", label: "Lightly active" },
                { value: "moderate", label: "Moderately active" },
                { value: "active", label: "Active" },
                { value: "very-active", label: "Very active" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActivityLevel(option.value)}
                className={`rounded-xl border px-4 py-2 text-left text-sm font-medium ${
                  activityLevel === option.value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-sm font-medium text-slate-700">Goal</label>
          <div className="grid gap-3 md:grid-cols-3">
            {(["lose", "maintain", "gain"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setGoal(value)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                  goal === value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          {goal !== "maintain" && (
            <div>
              <label className="text-sm font-medium text-slate-700">Weekly pace (kg)</label>
              <div className="mt-2 flex gap-2">
                {paceOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPace(option)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                      pace === option
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Your plan</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">BMR</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatNumber(Math.round(bmr))}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">TDEE</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatNumber(Math.round(tdee))}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Target</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-600">
                {formatNumber(targetCalories)}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Based on your {goal} goal, we’ve set a daily target of
            {" "}
            <span className="font-semibold text-slate-900">
              {formatNumber(targetCalories)} calories.
            </span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
          disabled={step === 0}
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Save profile
          </button>
        )}
      </div>
    </div>
  );
}
