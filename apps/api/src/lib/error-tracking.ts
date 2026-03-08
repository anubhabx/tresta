import type { Request } from 'express';
import { ErrorSeverity, Prisma, prisma } from '@workspace/database/prisma';
import { ApiError } from './errors.js';
import { logger } from './logger.js';

type ErrorTrackingSource = 'request' | 'process' | 'web-client';

interface ErrorTrackingContext {
  source: ErrorTrackingSource;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  severity?: ErrorSeverity;
}

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_STACK_LENGTH = 16_000;
const MAX_ERROR_TYPE_LENGTH = 120;

const truncate = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function sanitizeMetadata(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (depth >= 4) {
    return '[Truncated]';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 25).map((entry) => sanitizeMetadata(entry, depth + 1));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .slice(0, 50)
        .map(([key, entry]) => [key, sanitizeMetadata(entry, depth + 1)]),
    );
  }

  return String(value);
}

function shouldPersistRequestError(error: Error | ApiError): boolean {
  if (error instanceof ApiError && error.statusCode < 500) {
    return false;
  }

  return ![
    'ZodError',
    'ValidationError',
    'SyntaxError',
    'JsonWebTokenError',
    'TokenExpiredError',
    'MulterError',
  ].includes(error.name);
}

function resolveSeverity(error: Error | ApiError, context: ErrorTrackingContext): ErrorSeverity {
  if (context.severity) {
    return context.severity;
  }

  if (context.source === 'process') {
    return ErrorSeverity.CRITICAL;
  }

  if (error instanceof ApiError && error.statusCode < 500) {
    return ErrorSeverity.WARNING;
  }

  if (context.source === 'web-client') {
    return ErrorSeverity.ERROR;
  }

  return ErrorSeverity.ERROR;
}

async function persistErrorLog(error: Error | ApiError, context: ErrorTrackingContext): Promise<void> {
  try {
    const metadata = sanitizeMetadata({
      source: context.source,
      ...context.metadata,
    }) as Prisma.InputJsonValue;

    await prisma.errorLog.create({
      data: {
        severity: resolveSeverity(error, context),
        errorType: truncate(error.name || 'Error', MAX_ERROR_TYPE_LENGTH),
        message: truncate(error.message || 'Unknown error', MAX_MESSAGE_LENGTH),
        stackTrace: error.stack ? truncate(error.stack, MAX_STACK_LENGTH) : undefined,
        requestId: context.requestId,
        userId: context.userId,
        metadata,
      },
    });
  } catch (trackingError) {
    logger.error(
      {
        error: trackingError,
        trackedErrorName: error.name,
        trackedRequestId: context.requestId,
        source: context.source,
      },
      'Failed to persist error log',
    );
  }
}

export function captureRequestError(error: Error | ApiError, req: Request): void {
  if (!shouldPersistRequestError(error)) {
    return;
  }

  void persistErrorLog(error, {
    source: 'request',
    requestId: req.requestId,
    userId: (req as Request & { user?: { id?: string } }).user?.id,
    metadata: {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
      query: Object.keys(req.query || {}).length > 0 ? req.query as Record<string, unknown> : undefined,
    },
  });
}

export function captureProcessError(
  error: Error,
  source: 'uncaughtException' | 'unhandledRejection',
  metadata?: Record<string, unknown>,
): Promise<void> {
  return persistErrorLog(error, {
    source: 'process',
    severity: ErrorSeverity.CRITICAL,
    metadata: {
      processSource: source,
      ...metadata,
    },
  });
}

export function captureWebClientError(input: {
  message: string;
  errorType?: string;
  stackTrace?: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const error = new Error(input.message);
  error.name = input.errorType || 'WebClientError';
  if (input.stackTrace) {
    error.stack = input.stackTrace;
  }

  return persistErrorLog(error, {
    source: 'web-client',
    requestId: input.requestId,
    userId: input.userId,
    metadata: input.metadata,
  });
}