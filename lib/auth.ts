export const SESSION_COOKIE = "ci_session";

export function passwordConfigured() {
  return Boolean(process.env.APP_PASSWORD);
}

export async function expectedSessionToken() {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    return null;
  }

  const data = new TextEncoder().encode(`chess-improver:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function isValidSession(token: string | undefined) {
  const expected = await expectedSessionToken();
  if (!expected) {
    return true;
  }
  return token === expected;
}
