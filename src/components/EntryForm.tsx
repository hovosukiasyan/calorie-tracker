"use client";

import { useState } from "react";
import type { Entry } from "@/src/db";
import { entrySchema } from "@/src/lib/validation";
import { useI18n } from "@/src/i18n/LanguageProvider";

export type EntryFormValues = Omit<Entry, "id" | "dayKey">;

const numberValue = (value: string) => (value === "" ? undefined : Number(value));

const isoToLocalInputValue = (iso: string) => {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function EntryForm({
  initialValues,
  onSubmit,
  onCancel,
}: {
  initialValues: EntryFormValues;
  onSubmit: (values: EntryFormValues) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
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
      setError(t("entry.error.invalid"));
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
          {t("entry.labels.label")}
        </label>
        <input
          value={form.label}
          onChange={handleChange("label")}
          placeholder={t("entry.placeholder.label")}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("entry.labels.calories")}
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
            {t("today.macros.protein")} (g)
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
            {t("today.macros.carbs")} (g)
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
            {t("today.macros.fat")} (g)
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
          {t("entry.labels.time")}
        </label>
        <input
          type="datetime-local"
          value={isoToLocalInputValue(form.createdAt)}
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
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950"
        >
          {t("common.save")}
        </button>
      </div>
    </form>
  );
}
