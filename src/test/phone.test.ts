import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/lib/phone";

describe("family phone numbers", () => {
  it("normalizes Norwegian numbers for matching approved members", () => {
    expect(normalizePhone("912 34 567")).toBe("+4791234567");
    expect(normalizePhone("0047 912 34 567")).toBe("+4791234567");
    expect(normalizePhone("+47 912 34 567")).toBe("+4791234567");
  });
  it("rejects invalid phone numbers", () => {
    expect(normalizePhone("einar@example.com")).toBeNull();
    expect(normalizePhone("+0123456789")).toBeNull();
    expect(normalizePhone("123")).toBeNull();
  });
});