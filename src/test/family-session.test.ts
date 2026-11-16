import { describe, expect, it } from "vitest";
import { familyPasswordInput, issueFamilySession, passwordMatches, verifyFamilySession } from "@/lib/family-session";

describe("shared family password", () => {
  const password = "example-test-password";
  const secret = "test-only-signing-key";
  const now = Date.UTC(2026, 10, 16);

  it("rejects wrong passwords", async () => {
    expect(await passwordMatches("wrong-password", password)).toBe(false);
    expect(await passwordMatches(password, password)).toBe(true);
  });
  it("validates a signed family session", async () => {
    const token = await issueFamilySession(secret, password, now);
    expect(await verifyFamilySession(token, secret, password, now)).toBe(true);
    expect(await verifyFamilySession(`${token.slice(0, -2)}00`, secret, password, now)).toBe(false);
  });
  it("expires sessions and revokes them after changing the password", async () => {
    const token = await issueFamilySession(secret, password, now);
    expect(await verifyFamilySession(token, secret, password, now + 12 * 60 * 60 * 1000)).toBe(false);
    expect(await verifyFamilySession(token, secret, "changed-test-password", now)).toBe(false);
  });
  it("rejects missing or oversized password inputs", () => {
    expect(familyPasswordInput.safeParse({ password: "" }).success).toBe(false);
    expect(familyPasswordInput.safeParse({ password: "x".repeat(257) }).success).toBe(false);
  });
});