"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/src/db";

export default function Home() {
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <p className="text-sm text-slate-400">Loading your calorie tracker…</p>
    </div>
  );
}
