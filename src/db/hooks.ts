"use client";

import { useLiveQuery } from "dexie-react-hooks";

import { db, Entry, Profile } from "@/src/db";

export const useProfile = () =>
  useLiveQuery(() => db.profile.get("profile"), [], undefined as Profile | undefined);

export const useEntriesByDay = (dayKey: string) =>
  useLiveQuery(
    () => db.entries.where("dayKey").equals(dayKey).toArray(),
    [dayKey],
    [] as Entry[],
  );

export const useEntriesSince = (startDayKey: string) =>
  useLiveQuery(
    () => db.entries.where("dayKey").aboveOrEqual(startDayKey).sortBy("dayKey"),
    [startDayKey],
    [] as Entry[],
  );
