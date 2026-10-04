/**
 * Centralized Expo public env for B1.3 Train API integration.
 *
 * EXPO_PUBLIC_* values are embedded at Metro bundle time.
 * Do not hardcode machine IPs or secrets here.
 *
 * EXPO_PUBLIC_DEV_USER_ID is TEMPORARY until Identity/Profile supplies a real user.
 */

function readRequired(name: string): string {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') {
    throw new Error(
      `${name} is not set. Add it to your local .env (see .env.example) and restart Expo.`,
    );
  }
  return String(raw).trim();
}

/** Backend API origin, no trailing slash. Example: http://127.0.0.1:8000 */
export function getApiBaseUrl(): string {
  const url = readRequired('EXPO_PUBLIC_API_URL').replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(
      `EXPO_PUBLIC_API_URL must be an absolute http(s) URL (got ${JSON.stringify(url)}).`,
    );
  }
  return url;
}

/**
 * Temporary development user PK for Train API calls.
 * Replace during Identity/Profile integration — do not treat as auth.
 */
export function getDevUserId(): number {
  const raw = readRequired('EXPO_PUBLIC_DEV_USER_ID');
  if (!/^\d+$/.test(raw)) {
    throw new Error(
      `EXPO_PUBLIC_DEV_USER_ID must be a positive integer (got ${JSON.stringify(raw)}).`,
    );
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(
      `EXPO_PUBLIC_DEV_USER_ID must be a positive integer (got ${JSON.stringify(raw)}).`,
    );
  }
  return value;
}
