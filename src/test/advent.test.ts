import { describe, it, expect } from "vitest";
import { calendarDays, isDoorOpenable } from "@/lib/advent";

describe("door unlocking", () => {
  it("door 5 is locked on 4 December (Oslo)", () => {
    expect(isDoorOpenable(5, new Date("2026-12-04T12:00:00Z"))).toBe(false);
  });
  it("door 5 opens on 5 December at Oslo midnight", () => {
    expect(isDoorOpenable(5, new Date("2026-12-04T23:30:00Z"))).toBe(true);
  });
  it("nothing opens in November", () => {
    expect(isDoorOpenable(1, new Date("2026-11-30T12:00:00Z"))).toBe(false);
  });
  it("opens all 24 doors for testing in the development preview", () => {
    expect(calendarDays(new Date("2026-11-16T12:23:00Z"), true)).toEqual(
      Array.from({ length: 24 }, (_, i) => i + 1),
    );
  });
  it("keeps all production doors locked before December", () => {
    expect(calendarDays(new Date("2026-11-16T12:23:00Z"), false)).toEqual([]);
  });
});
