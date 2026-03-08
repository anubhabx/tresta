import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { captureWebClientError } from '../lib/error-tracking.js';
import { ResponseHandler } from '../lib/response.js';
import { getRequestLogger } from '../lib/logger.js';

const ClientErrorSchema = z.object({
  source: z.enum(['react-boundary', 'global-boundary', 'window-error', 'unhandled-rejection']),
  message: z.string().min(1).max(4000),
  name: z.string().min(1).max(120).optional(),
  stack: z.string().max(16000).optional(),
  digest: z.string().max(255).optional(),
  componentStack: z.string().max(16000).optional(),
  pathname: z.string().max(2000).optional(),
  href: z.string().url().max(4000).optional(),
  userAgent: z.string().max(2000).optional(),
  timestamp: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function captureClientError(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const requestLogger = getRequestLogger(req);
    const payload = ClientErrorSchema.parse(req.body ?? {});

    await captureWebClientError({
      message: payload.message,
      errorType: payload.name || 'WebClientError',
      stackTrace: payload.stack,
      requestId: req.requestId,
      metadata: {
        clientSource: payload.source,
        digest: payload.digest,
        componentStack: payload.componentStack,
        pathname: payload.pathname,
        href: payload.href,
        userAgent: payload.userAgent,
        clientTimestamp: payload.timestamp,
        ...payload.metadata,
      },
    });

    requestLogger.warn(
      {
        errorType: payload.name || 'WebClientError',
        clientSource: payload.source,
        pathname: payload.pathname,
      },
      'Captured web client error',
    );

    ResponseHandler.success(res, {
      statusCode: 202,
      message: 'Client error captured',
      data: { requestId: req.requestId },
    });
  } catch (error) {
    next(error);
  }
}