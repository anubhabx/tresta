/**
 * Centralized secret configuration.
 * All secrets are required at startup — the process will crash immediately
 * if any are missing, preventing the app from running with insecure defaults.
 */

export const SETTINGS_HMAC_SECRET = process.env.SETTINGS_HMAC_SECRET ?? (() => {
  throw new Error('SETTINGS_HMAC_SECRET environment variable must be set');
})();
