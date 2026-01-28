export const getDayKey = (date: Date) =>
  date.toISOString().slice(0, 10);

export const getLocalDayKey = (date: Date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};

export const formatDay = (dayKey: string) => {
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatLongDate = (dayKey: string) => {
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
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
