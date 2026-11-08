/**
 * Admin sessions: a signed, expiring cookie (HMAC SHA-256 via Web Crypto so
 * the same code runs in Proxy and in Node). The signing key is derived from
 * ADMIN_PASSWORD, so changing the password signs everyone out.
 */

export const SESSION_COOKIE = "sk_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

const encoder = new TextEncoder();

function signingSecret(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return `${password}::${process.env.SESSION_SECRET ?? "sibikabilan.com"}`;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const secret = signingSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured.");
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin.${expires}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = signingSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires * 1000 < Date.now()) return false;
  const expected = await hmac(secret, `${parts[0]}.${parts[1]}`);
  return safeEqual(expected, parts[2]);
}

/** Compares HMACs rather than raw strings so timing leaks nothing about length. */
export async function verifyPassword(candidate: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !candidate) return false;
  const key = "password-check";
  const [a, b] = await Promise.all([hmac(key, candidate), hmac(key, password)]);
  return safeEqual(a, b);
}
