const DEFAULT_CDN_BASE_URL = 'https://api.tresta.app';
const DEFAULT_API_BASE_URL = 'https://api.tresta.app';

type EnvRecord = Record<string, string | undefined>;

const getEnvSource = (): EnvRecord => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env as EnvRecord;
  }

  const globalProcess = typeof globalThis !== 'undefined'
    ? (globalThis as { process?: { env?: EnvRecord } }).process
    : undefined;

  if (globalProcess?.env) {
    return globalProcess.env;
  }

  return {};
};

const envSource = getEnvSource();

const getEnvValue = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = envSource[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const normalizeUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value.replace(/\/+$/, '');
};

const toHostname = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return value
      .replace(/^https?:\/\//, '')
      .replace(/\/.+$/, '')
      .trim();
  }
};

const parseCommaSeparated = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export const WIDGET_CDN_BASE_URL =
  normalizeUrl(
    getEnvValue('VITE_WIDGET_CDN_BASE_URL', 'NEXT_PUBLIC_WIDGET_CDN_BASE_URL')
  ) ?? DEFAULT_CDN_BASE_URL;

export const WIDGET_API_BASE_URL =
  normalizeUrl(
    getEnvValue('VITE_WIDGET_API_BASE_URL', 'NEXT_PUBLIC_WIDGET_API_BASE_URL')
  ) ?? DEFAULT_API_BASE_URL;

export const WIDGET_TELEMETRY_ENDPOINT =
  normalizeUrl(
    getEnvValue('VITE_WIDGET_TELEMETRY_ENDPOINT', 'NEXT_PUBLIC_WIDGET_TELEMETRY_ENDPOINT')
  ) ?? `${WIDGET_API_BASE_URL}/telemetry`;

const additionalDomains = parseCommaSeparated(
  getEnvValue('VITE_WIDGET_ALLOWED_DOMAINS', 'NEXT_PUBLIC_WIDGET_ALLOWED_DOMAINS')
);

export const WIDGET_ALLOWED_DOMAINS = Array.from(
  new Set(
    [
      toHostname(WIDGET_CDN_BASE_URL),
      toHostname(WIDGET_API_BASE_URL),
      ...additionalDomains,
    ].filter(Boolean) as string[]
  )
);

const normalizeVersionSegment = (version: string): string => {
  if (!version) {
    return 'latest';
  }

  return version.startsWith('v') ? version : `v${version}`;
};

export const buildWidgetScriptUrl = (version: string): string => {
  return `${WIDGET_CDN_BASE_URL}/widget/${normalizeVersionSegment(version)}/tresta-widget.iife.js`;
};
