"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useProfile } from "@/src/db/hooks";

export default function HomePage() {
  const router = useRouter();
  const profile = useProfile();

  useEffect(() => {
    if (profile === undefined) return;
    if (profile) {
      router.replace("/today");
    } else {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-slate-500">Loading your data...</p>
      </div>
    </div>
  );
}
