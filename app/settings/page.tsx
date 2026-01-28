"use client";

import { useRef, useState } from "react";

import { db, Profile } from "@/src/db";
import { useProfile } from "@/src/db/hooks";
import { calculateBmr, calculateTargetCalories, calculateTdee } from "@/src/lib/calculations";

export default function SettingsPage() {
  const profile = useProfile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  if (profile === undefined) return null;

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    const formData = new FormData(event.currentTarget);
    const updated = {
      sex: formData.get("sex") as Profile["sex"],
      age: Number(formData.get("age")),
      heightCm: Number(formData.get("heightCm")),
      weightKg: Number(formData.get("weightKg")),
      activityLevel: formData.get("activityLevel") as Profile["activityLevel"],
      goal: formData.get("goal") as Profile["goal"],
      pace: Number(formData.get("pace")),
    };
    const bmr = calculateBmr(updated);
    const tdee = calculateTdee(bmr, updated.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, updated.goal, updated.pace);
    await db.profile.put({
      ...profile,
      ...updated,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      updatedAt: new Date().toISOString(),
    });
    setStatus("Profile updated.");
  };

  const handleExport = async () => {
    const exportData = {
      profile: await db.profile.get("profile"),
      entries: await db.entries.toArray(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `calorie-tracker-export-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    const parsed = JSON.parse(content) as {
      profile?: Profile;
      entries?: unknown[];
    };
    await db.transaction("rw", db.profile, db.entries, async () => {
      await db.profile.clear();
      await db.entries.clear();
      if (parsed.profile) {
        await db.profile.put(parsed.profile);
      }
      if (parsed.entries?.length) {
        await db.entries.bulkAdd(parsed.entries as any);
      }
    });
    setStatus("Import complete.");
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all data? This cannot be undone.")) return;
    await db.transaction("rw", db.profile, db.entries, async () => {
      await db.profile.clear();
      await db.entries.clear();
    });
    setStatus("All data cleared.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Update your profile and manage data.</p>
      </div>

      {profile ? (
        <form
          onSubmit={handleProfileSave}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Sex</label>
              <select
                name="sex"
                defaultValue={profile.sex}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Age</label>
              <input
                type="number"
                name="age"
                defaultValue={profile.age}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Height (cm)</label>
              <input
                type="number"
                name="heightCm"
                defaultValue={profile.heightCm}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Weight (kg)</label>
              <input
                type="number"
                name="weightKg"
                defaultValue={profile.weightKg}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Activity level</label>
            <select
              name="activityLevel"
              defaultValue={profile.activityLevel}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very-active">Very active</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Goal</label>
              <select
                name="goal"
                defaultValue={profile.goal}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="lose">Lose</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Weekly pace (kg)</label>
              <input
                type="number"
                step="0.25"
                name="pace"
                defaultValue={profile.pace}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Save changes
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          No profile found. Complete onboarding to create one.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Data management</h2>
        <p className="mt-1 text-sm text-slate-500">
          Export or import your local data, or reset the app.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
          >
            Reset all data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {status ? <p className="mt-3 text-sm text-emerald-600">{status}</p> : null}
      </div>
    </div>
  );
}
