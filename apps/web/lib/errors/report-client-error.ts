import { getApiUrl } from '@/config/env';

export type ClientErrorSource =
  | 'react-boundary'
  | 'global-boundary'
  | 'window-error'
  | 'unhandled-rejection';

export interface ClientErrorPayload {
  source: ClientErrorSource;
  message: string;
  name?: string;
  stack?: string;
  digest?: string;
  componentStack?: string;
  pathname?: string;
  href?: string;
  metadata?: Record<string, unknown>;
}

const MAX_REPORTED_ERRORS = 100;
const reportedFingerprints: string[] = [];
const reportedFingerprintSet = new Set<string>();

function rememberFingerprint(fingerprint: string): boolean {
  if (reportedFingerprintSet.has(fingerprint)) {
    return false;
  }

  reportedFingerprintSet.add(fingerprint);
  reportedFingerprints.push(fingerprint);

  if (reportedFingerprints.length > MAX_REPORTED_ERRORS) {
    const oldestFingerprint = reportedFingerprints.shift();
    if (oldestFingerprint) {
      reportedFingerprintSet.delete(oldestFingerprint);
    }
  }

  return true;
}

function toMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown client error';
}

export function reportClientError(payload: ClientErrorPayload): void {
  if (typeof window === 'undefined') {
    return;
  }

  const body = {
    ...payload,
    pathname: payload.pathname ?? window.location.pathname,
    href: payload.href ?? window.location.href,
    userAgent: window.navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  const fingerprint = JSON.stringify([
    body.source,
    body.name,
    body.message,
    body.digest,
    body.pathname,
    body.stack,
  ]);

  if (!rememberFingerprint(fingerprint)) {
    return;
  }

  const serializedBody = JSON.stringify(body);
  const endpoint = getApiUrl('/api/public/errors/client');

  try {
    if (typeof navigator.sendBeacon === 'function' && serializedBody.length < 60_000) {
      const blob = new Blob([serializedBody], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: serializedBody,
    keepalive: true,
    credentials: 'omit',
  }).catch(() => undefined);
}

export function reportErrorFromUnknown(
  source: ClientErrorSource,
  error: unknown,
  metadata?: Record<string, unknown>,
): void {
  if (error instanceof Error) {
    reportClientError({
      source,
      message: error.message,
      name: error.name,
      stack: error.stack,
      metadata,
    });
    return;
  }

  reportClientError({
    source,
    message: toMessage(error),
    metadata,
  });
}