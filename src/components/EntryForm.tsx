"use client";

import { useState } from "react";

import { Entry } from "@/src/db";

interface EntryFormProps {
  initial?: Entry;
  onSave: (entry: Entry) => void;
  onCancel: () => void;
}

export const EntryForm = ({ initial, onSave, onCancel }: EntryFormProps) => {
  const toLocalInputValue = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };
  const [label, setLabel] = useState(initial?.label ?? "");
  const [calories, setCalories] = useState(`${initial?.calories ?? ""}`);
  const [protein, setProtein] = useState(`${initial?.protein ?? ""}`);
  const [carbs, setCarbs] = useState(`${initial?.carbs ?? ""}`);
  const [fat, setFat] = useState(`${initial?.fat ?? ""}`);
  const [timestamp, setTimestamp] = useState(
    initial?.createdAt ? toLocalInputValue(new Date(initial.createdAt)) : toLocalInputValue(new Date()),
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedCalories = Number(calories);
    if (!Number.isFinite(parsedCalories) || parsedCalories <= 0) return;
    const updated: Entry = {
      ...initial,
      createdAt: new Date(timestamp).toISOString(),
      label: label.trim() || undefined,
      calories: parsedCalories,
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      fat: fat ? Number(fat) : undefined,
      dayKey: initial?.dayKey ?? "",
    };
    onSave(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Time</label>
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(event) => setTimestamp(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Label (optional)</label>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          placeholder="Greek yogurt"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Calories</label>
        <input
          type="number"
          min={0}
          value={calories}
          onChange={(event) => setCalories(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          required
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Protein (g)</label>
          <input
            type="number"
            min={0}
            value={protein}
            onChange={(event) => setProtein(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Carbs (g)</label>
          <input
            type="number"
            min={0}
            value={carbs}
            onChange={(event) => setCarbs(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Fat (g)</label>
          <input
            type="number"
            min={0}
            value={fat}
            onChange={(event) => setFat(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Save entry
        </button>
      </div>
    </form>
  );
};
