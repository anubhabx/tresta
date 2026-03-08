import type { Request, Response, NextFunction } from "express";
import { ApiError } from '../lib/errors.js';
import { ResponseHandler } from '../lib/response.js';
import { getRequestLogger } from '../lib/logger.js';
import { captureRequestError } from '../lib/error-tracking.js';

/**
 * Global error handling middleware
 * Catches all errors and sends standardized error responses
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestLogger = getRequestLogger(req);

  const errorLog = {
    message: error.message,
    name: error.name,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userId: (req as any).user?.id,
    ...(error instanceof ApiError && {
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    }),
  };

  if (process.env.NODE_ENV === "development") {
    requestLogger.error({ ...errorLog, stack: error.stack }, "Request error");
  } else {
    requestLogger.error(errorLog, "Request error");
  }

  captureRequestError(error, req);

  if (error instanceof ApiError) {
    return ResponseHandler.error(
      res,
      error.statusCode,
      error.message,
      error.code,
      process.env.NODE_ENV === "development"
        ? { ...error.details, stack: error.stack }
        : error.details,
    );
  }

  if (error.name === "ZodError") {
    const zodError = error as any;
    return ResponseHandler.validationError(
      res,
      "Validation failed",
      {
        issues: zodError.issues?.map((issue: any) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      },
    );
  }

  if (error.name === "ValidationError" && (error as any).errors) {
    return ResponseHandler.validationError(
      res,
      error.message,
      (error as any).errors,
    );
  }

  if (error instanceof SyntaxError && "body" in error) {
    return ResponseHandler.badRequest(
      res,
      "Invalid JSON payload. Please check your request body.",
      { syntaxError: error.message },
    );
  }

  if (error.name === "JsonWebTokenError") {
    return ResponseHandler.unauthorized(
      res,
      "Invalid authentication token",
    );
  }

  if (error.name === "TokenExpiredError") {
    return ResponseHandler.unauthorized(
      res,
      "Authentication token has expired",
    );
  }

  if (error.name === "MulterError") {
    const multerError = error as any;
    if (multerError.code === "LIMIT_FILE_SIZE") {
      return ResponseHandler.badRequest(
        res,
        "File size exceeds the maximum allowed limit",
        { maxSize: multerError.limit },
      );
    }
    return ResponseHandler.badRequest(
      res,
      `File upload error: ${multerError.message}`,
      { code: multerError.code },
    );
  }

  if (error.message?.includes("Can't reach database server")) {
    return ResponseHandler.serviceUnavailable(
      res,
      "Database connection failed. Please try again later.",
    );
  }

  return ResponseHandler.internalError(
    res,
    process.env.NODE_ENV === "development"
      ? error.message
      : "An unexpected error occurred. Please try again later.",
  );
};

/**
 * 404 Not Found handler for unmatched routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestLogger = getRequestLogger(req);
  requestLogger.warn({ path: req.path, method: req.method }, "Route not found");
  ResponseHandler.notFound(res, `Route ${req.method} ${req.path} not found`);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates the need for try-catch blocks in every controller
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
