"use client";

import Dexie, { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very-active";
export type Goal = "lose" | "maintain" | "gain";

export type Profile = {
  id: "profile";
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  pace: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  createdAt: string;
  updatedAt: string;

  // Optional deficit tracking settings
  deficitGoalKg?: number; // e.g. 10
  deficitKcalPerKg?: number; // default 7700
  deficitUseTargetChange?: boolean; // enable before/after targets
  deficitTargetBefore?: number; // kcal/day
  deficitTargetAfter?: number; // kcal/day
  deficitChangeDay?: number; // day index (1-based) when target switches
};

export type Entry = {
  id?: number;
  createdAt: string;
  dayKey: string;
  label?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

class CalorieTrackerDB extends Dexie {
  profile!: Table<Profile, string>;
  entries!: Table<Entry, number>;

  constructor() {
    super("CalorieTrackerDB");
    this.version(1).stores({
      profile: "id",
      entries: "++id, dayKey, createdAt",
    });
  }
}

export const db = new CalorieTrackerDB();
export const PROFILE_ID = "profile" as const;

export const useProfile = () =>
  useLiveQuery(async () => (await db.profile.get(PROFILE_ID)) ?? null);

export const useEntriesForDay = (dayKey: string) =>
  useLiveQuery(() => db.entries.where("dayKey").equals(dayKey).toArray(), [
    dayKey,
  ]);

export const useEntriesBetweenDays = (start: string, end: string) =>
  useLiveQuery(
    () => db.entries.where("dayKey").between(start, end, true, true).toArray(),
    [start, end],
  );

export const useEntryDayBounds = () =>
  useLiveQuery(
    async () => {
      const first = await db.entries.orderBy("dayKey").first();
      const last = await db.entries.orderBy("dayKey").last();
      return {
        firstDayKey: first?.dayKey ?? null,
        lastDayKey: last?.dayKey ?? null,
      };
    },
    [],
    { firstDayKey: null as string | null, lastDayKey: null as string | null },
  );
