import Dexie, { Table } from "dexie";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very-active";

export type GoalType = "lose" | "maintain" | "gain";

export interface Profile {
  id: "profile";
  sex: "male" | "female";
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
  pace: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id?: number;
  createdAt: string;
  dayKey: string;
  label?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

class CalorieTrackerDB extends Dexie {
  profile!: Table<Profile, "profile">;
  entries!: Table<Entry, number>;

  constructor() {
    super("calorie-tracker");
    this.version(1).stores({
      profile: "id",
      entries: "++id, dayKey, createdAt",
    });
  }
}

export const db = new CalorieTrackerDB();
