import { describe, it, expect } from "vitest";
import { isDoorOpenable } from "@/lib/advent";

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
});
