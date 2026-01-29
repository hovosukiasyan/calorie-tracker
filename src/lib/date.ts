export const getDayKey = (date: Date) =>
  date.toISOString().slice(0, 10);

export const getLocalDayKey = (date: Date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};

export const formatDay = (dayKey: string, locale = "en-US") => {
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatLongDate = (dayKey: string, locale = "en-US") => {
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const subtractDays = (dayKey: string, days: number) => {
  const date = new Date(`${dayKey}T00:00:00`);
  date.setDate(date.getDate() - days);
  return getLocalDayKey(date);
};

export const addDays = (dayKey: string, days: number) => {
  const date = new Date(`${dayKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return getLocalDayKey(date);
};

const toLocalNoonDate = (dayKey: string) => new Date(`${dayKey}T12:00:00`);

export const diffDayKeys = (fromDayKey: string, toDayKey: string) => {
  const a = toLocalNoonDate(fromDayKey).getTime();
  const b = toLocalNoonDate(toDayKey).getTime();
  return Math.round((b - a) / 86400000);
};

export const enumerateDayKeys = (startDayKey: string, endDayKey: string) => {
  const result: string[] = [];
  let current = startDayKey;
  result.push(current);
  while (current !== endDayKey) {
    current = addDays(current, 1);
    // safety
    if (result.length > 5000) break;
    result.push(current);
  }
  return result;
};

export const getMonthRange = (yearMonth: string) => {
  const [yStr, mStr] = yearMonth.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const first = new Date(year, month - 1, 1, 12, 0, 0);
  const last = new Date(year, month, 0, 12, 0, 0);
  return {
    startDayKey: getLocalDayKey(first),
    endDayKey: getLocalDayKey(last),
  };
};

const isoWeekStartLocal = (year: number, week: number) => {
  // ISO week 1 contains Jan 4th.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7; // 1..7 (Mon..Sun)
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - day + 1);

  const targetMondayUTC = new Date(mondayWeek1);
  targetMondayUTC.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);

  // Convert to local date at noon to avoid DST issues.
  return new Date(
    targetMondayUTC.getUTCFullYear(),
    targetMondayUTC.getUTCMonth(),
    targetMondayUTC.getUTCDate(),
    12,
    0,
    0,
  );
};

export const getWeekRange = (isoWeek: string) => {
  // format: YYYY-Www
  const [yPart, wPart] = isoWeek.split("-W");
  const year = Number(yPart);
  const week = Number(wPart);
  const start = isoWeekStartLocal(year, week);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    startDayKey: getLocalDayKey(start),
    endDayKey: getLocalDayKey(end),
  };
};

export const getISOWeekString = (date: Date) => {
  // ISO week-numbering year/week (based on UTC to avoid timezone issues)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = d.getUTCFullYear();
  return `${year}-W${String(week).padStart(2, "0")}`;
};
