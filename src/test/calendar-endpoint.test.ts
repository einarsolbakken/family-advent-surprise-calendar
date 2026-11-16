import { afterEach, describe, expect, it, vi } from "vitest";
import { calendarEndpointOrigin, requestCalendar } from "@/lib/calendar-endpoint";

afterEach(() => vi.unstubAllGlobals());

describe("calendar endpoint", () => {
  it("uses the preview server instead of a stale published server during development", () => {
    expect(calendarEndpointOrigin(true, "https://calendar.example")).toBe("");
  });
  it("uses the configured hosted server for GitHub Pages", () => {
    expect(calendarEndpointOrigin(false, "https://calendar.example/")).toBe("https://calendar.example");
  });
  it("handles unreachable endpoints with a Norwegian message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(requestCalendar("/api/public/calendar", {})).rejects.toThrow("Får ikke kontakt med kalenderen. Prøv igjen om litt.");
  });
});