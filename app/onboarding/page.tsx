"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, PROFILE_ID, useProfile } from "@/src/db";
import OnboardingWizard from "@/src/components/OnboardingWizard";

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useProfile();

  useEffect(() => {
    if (profile) {
      router.replace("/today");
    }
  }, [profile, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Welcome
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Let’s set up your calorie targets
          </h1>
          <p className="text-sm text-slate-400">
            This stays on your device and powers your daily targets, history, and
            analytics.
          </p>
        </div>
        <OnboardingWizard
          onComplete={async (nextProfile) => {
            await db.profile.put({ ...nextProfile, id: PROFILE_ID });
            router.replace("/today");
          }}
        />
      </div>
    </div>
  );
}
