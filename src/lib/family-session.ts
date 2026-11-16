import { z } from "zod";

export const familyPasswordInput = z.object({ password: z.string().min(1).max(256) });
const SESSION_SECONDS = 12 * 60 * 60;

async function signingKey(secret: string, password: string) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(JSON.stringify([secret, password])), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function passwordMatches(candidate: string, expected: string) {
  const digest = (value: string) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const [a, b] = await Promise.all([digest(candidate), digest(expected)]);
  const left = new Uint8Array(a), right = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return difference === 0;
}

export async function issueFamilySession(secret: string, password: string, now = Date.now()) {
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${crypto.randomUUID()}`;
  const signature = await crypto.subtle.sign("HMAC", await signingKey(secret, password), new TextEncoder().encode(payload));
  return `family.${payload}.${Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function verifyFamilySession(token: string, secret: string, password: string, now = Date.now()) {
  const match = /^family\.(\d+)\.([\da-f-]{36})\.([\da-f]{64})$/.exec(token);
  if (!match) return false;
  const [, expires, nonce, hex] = match;
  if (!expires || !nonce || !hex) return false;
  const expiry = Number(expires), seconds = Math.floor(now / 1000);
  if (expiry <= seconds || expiry > seconds + SESSION_SECONDS) return false;
  const bytes = Uint8Array.from(hex.match(/.{2}/g) ?? [], byte => parseInt(byte, 16));
  return crypto.subtle.verify("HMAC", await signingKey(secret, password), bytes, new TextEncoder().encode(`${expires}.${nonce}`));
}