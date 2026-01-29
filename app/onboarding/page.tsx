"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, PROFILE_ID, useProfile } from "@/src/db";
import OnboardingWizard from "@/src/components/OnboardingWizard";
import LanguageSwitcher from "@/src/components/LanguageSwitcher";
import { useI18n } from "@/src/i18n/LanguageProvider";

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useProfile();
  const { t } = useI18n();

  useEffect(() => {
    if (profile) {
      router.replace("/today");
    }
  }, [profile, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {t("onboarding.welcome")}
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {t("onboarding.title")}
            </h1>
            <p className="text-sm text-slate-400">{t("onboarding.subtitle")}</p>
          </div>
          <LanguageSwitcher />
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
