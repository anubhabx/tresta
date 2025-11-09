import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/errors.ts";
import { ResponseHandler } from "../lib/response.ts";

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
  // Log error for debugging (in production, use a proper logger)
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle ApiError instances (custom errors from errors.ts)
  if (error instanceof ApiError) {
    return ResponseHandler.error(
      res,
      error.statusCode,
      error.message,
      getErrorCode(error.statusCode),
      process.env.NODE_ENV === "development" ? error.stack : undefined,
    );
  }

  // Handle validation errors (e.g., from express-validator or zod)
  if (error.name === "ValidationError") {
    return ResponseHandler.validationError(
      res,
      error.message,
      (error as any).errors,
    );
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && "body" in error) {
    return ResponseHandler.badRequest(res, "Invalid JSON payload");
  }

  // Default to 500 Internal Server Error for unknown errors
  return ResponseHandler.internalError(
    res,
    process.env.NODE_ENV === "development"
      ? error.message
      : "An unexpected error occurred",
  );
};

/**
 * Helper function to get error code from status code
 */
function getErrorCode(statusCode: number): string {
  const errorCodes: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    500: "INTERNAL_ERROR",
    503: "SERVICE_UNAVAILABLE",
  };

  return errorCodes[statusCode] || `ERROR_${statusCode}`;
}

/**
 * 404 Not Found handler for unmatched routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
