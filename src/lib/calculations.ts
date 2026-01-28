import { ActivityLevel, GoalType } from "@/src/db";

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
};

export const calculateBmr = (params: {
  sex: "male" | "female";
  age: number;
  heightCm: number;
  weightKg: number;
}) => {
  const base = 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age;
  return params.sex === "male" ? base + 5 : base - 161;
};

export const calculateTdee = (bmr: number, activityLevel: ActivityLevel) =>
  bmr * activityMultipliers[activityLevel];

const paceToCalories = (pace: number, goal: GoalType) => {
  const weeklyCalories = pace * 7700;
  const dailyCalories = weeklyCalories / 7;
  if (goal === "gain") return dailyCalories;
  if (goal === "lose") return -dailyCalories;
  return 0;
};

export const calculateTargetCalories = (tdee: number, goal: GoalType, pace: number) =>
  Math.max(1200, Math.round(tdee + paceToCalories(pace, goal)));

export const formatNumber = (value: number, decimals = 0) =>
  Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
