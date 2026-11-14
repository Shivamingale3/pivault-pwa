/** All calls go to `/api` on the site's own origin (the CSP only allows connect-src 'self'). */
export const API_PREFIX = "/api";

export const API_TIMEOUT_MS = 15_000;

export const API_ERROR_MESSAGES = {
  network: "Can't reach PiVault. Check your connection and try again.",
  timeout: "The request took too long. Try again.",
  invalidResponse: "PiVault sent a reply this app doesn't understand. Try again later.",
  fallback: "Something went wrong. Try again.",
} as const;
