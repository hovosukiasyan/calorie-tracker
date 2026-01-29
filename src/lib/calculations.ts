import type { ActivityLevel, Goal, Profile, Sex } from "@/src/db";

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
};

const paceAdjustments: Record<number, number> = {
  0.25: 275,
  0.5: 550,
  0.75: 825,
  1: 1100,
};

export const computeBmr = (sex: Sex, weightKg: number, heightCm: number, age: number) => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
};

export const computeTdee = (bmr: number, activityLevel: ActivityLevel) =>
  bmr * activityMultipliers[activityLevel];

export const computeTargetCalories = (
  tdee: number,
  goal: Goal,
  pace: number,
) => {
  if (goal === "maintain") return tdee;
  const adjustment = paceAdjustments[pace] ?? pace * 7700 / 7;
  return goal === "lose" ? tdee - adjustment : tdee + adjustment;
};

export const buildProfile = (input: Omit<Profile, "id" | "bmr" | "tdee" | "targetCalories" | "createdAt" | "updatedAt">) => {
  const bmr = computeBmr(input.sex, input.weightKg, input.heightCm, input.age);
  const tdee = computeTdee(bmr, input.activityLevel);
  const targetCalories = computeTargetCalories(tdee, input.goal, input.pace);
  const now = new Date().toISOString();
  return {
    ...input,
    id: "profile" as const,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    createdAt: now,
    updatedAt: now,
  };
};

export const updateProfile = (profile: Profile, updates: Partial<Profile>) => {
  const merged = { ...profile, ...updates };
  const bmr = computeBmr(merged.sex, merged.weightKg, merged.heightCm, merged.age);
  const tdee = computeTdee(bmr, merged.activityLevel);
  const targetCalories = computeTargetCalories(tdee, merged.goal, merged.pace);
  return {
    ...merged,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    updatedAt: new Date().toISOString(),
  };
};

export const formatNumber = (value: number, locale = "en-US", maximumFractionDigits = 0) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
