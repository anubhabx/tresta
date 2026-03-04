import type { NextFunction, Request, Response } from 'express';
import pino from 'pino';
import { randomUUID } from 'crypto';

const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

export const logger = pino({
  level,
  base: {
    service: 'tresta-api',
    env: process.env.NODE_ENV || 'development',
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'secret',
      '*.password',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
});

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingRequestId = req.header('x-request-id');
  const requestId = incomingRequestId?.trim() || randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}

export function getRequestLogger(req: Request) {
  return logger.child({
    requestId: req.requestId,
    method: req.method,
    path: req.path,
  });
}
