"use client";

import { useState } from "react";
import type { Entry } from "@/src/db";
import { entrySchema } from "@/src/lib/validation";

export type EntryFormValues = Omit<Entry, "id" | "dayKey">;

const numberValue = (value: string) => (value === "" ? undefined : Number(value));

export default function EntryForm({
  initialValues,
  onSubmit,
  onCancel,
}: {
  initialValues: EntryFormValues;
  onSubmit: (values: EntryFormValues) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(() => ({
    label: initialValues.label ?? "",
    calories: initialValues.calories.toString(),
    protein: initialValues.protein?.toString() ?? "",
    carbs: initialValues.carbs?.toString() ?? "",
    fat: initialValues.fat?.toString() ?? "",
    createdAt: initialValues.createdAt,
  }));
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      label: form.label.trim() || undefined,
      calories: Number(form.calories),
      protein: numberValue(form.protein),
      carbs: numberValue(form.carbs),
      fat: numberValue(form.fat),
      createdAt: form.createdAt,
    };

    const result = entrySchema.safeParse(payload);
    if (!result.success) {
      setError("Please provide valid entry details.");
      return;
    }

    setError(null);
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Label
        </label>
        <input
          value={form.label}
          onChange={handleChange("label")}
          placeholder="e.g. Greek yogurt"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Calories
        </label>
        <input
          type="number"
          min="0"
          value={form.calories}
          onChange={handleChange("calories")}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Protein (g)
          </label>
          <input
            type="number"
            min="0"
            value={form.protein}
            onChange={handleChange("protein")}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Carbs (g)
          </label>
          <input
            type="number"
            min="0"
            value={form.carbs}
            onChange={handleChange("carbs")}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Fat (g)
          </label>
          <input
            type="number"
            min="0"
            value={form.fat}
            onChange={handleChange("fat")}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Time
        </label>
        <input
          type="datetime-local"
          value={form.createdAt.slice(0, 16)}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              createdAt: new Date(event.target.value).toISOString(),
            }))
          }
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950"
        >
          Save Entry
        </button>
      </div>
    </form>
  );
}
