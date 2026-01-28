import { z } from "zod";

export const profileSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z.number().int().min(13).max(120),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(250),
  activityLevel: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very-active",
  ]),
  goal: z.enum(["lose", "maintain", "gain"]),
  pace: z.number().min(0.1).max(1),
});

export const entrySchema = z.object({
  label: z.string().max(60).optional(),
  calories: z.number().min(0),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  createdAt: z.string(),
});
