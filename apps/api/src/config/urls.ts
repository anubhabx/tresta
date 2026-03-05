import type { Request } from 'express';

const normalizeUrl = (value: string): string => value.replace(/\/+$/, '');

export function getAppBaseUrl(): string {
  const configured = process.env.APP_URL || process.env.FRONTEND_URL;

  if (configured && configured.trim().length > 0) {
    return normalizeUrl(configured.trim());
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('APP_URL or FRONTEND_URL must be configured in production');
  }

  return 'http://localhost:3000';
}

export function getApiBaseUrl(req?: Request): string {
  const configured = process.env.API_URL;

  if (configured && configured.trim().length > 0) {
    return normalizeUrl(configured.trim());
  }

  const forwardedProto = req?.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto = forwardedProto || req?.protocol;
  const host = req?.get('x-forwarded-host') || req?.get('host');

  if (proto && host) {
    return `${proto}://${host}`;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('API_URL must be configured in production');
  }

  return `http://localhost:${process.env.PORT || 8000}`;
}
