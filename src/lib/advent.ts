// Pure date logic for the calendar. Doors unlock at midnight Norwegian time.
export function osloDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo", year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function isDoorOpenable(door: number, now: Date = new Date()) {
  const { month, day } = osloDateParts(now);
  return month === 12 && day >= door;
}

export function unlockedDays(now: Date = new Date()) {
  return Array.from({ length: 24 }, (_, i) => i + 1).filter((d) => isDoorOpenable(d, now));
}
