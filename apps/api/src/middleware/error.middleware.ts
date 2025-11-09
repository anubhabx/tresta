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
  // Log error for debugging (in production, use a proper logger like Winston or Pino)
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
      details: error.details 
    }),
  };

  // Log stack trace only in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", errorLog);
    console.error("Stack:", error.stack);
  } else {
    // In production, log without stack trace (use proper logger)
    console.error("Error:", errorLog);
  }

  // Handle ApiError instances (custom errors from errors.ts)
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

  // Handle Zod validation errors
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

  // Handle express-validator errors
  if (error.name === "ValidationError" && (error as any).errors) {
    return ResponseHandler.validationError(
      res,
      error.message,
      (error as any).errors,
    );
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && "body" in error) {
    return ResponseHandler.badRequest(
      res, 
      "Invalid JSON payload. Please check your request body.",
      { syntaxError: error.message }
    );
  }

  // Handle JWT/Token errors
  if (error.name === "JsonWebTokenError") {
    return ResponseHandler.unauthorized(
      res,
      "Invalid authentication token"
    );
  }

  if (error.name === "TokenExpiredError") {
    return ResponseHandler.unauthorized(
      res,
      "Authentication token has expired"
    );
  }

  // Handle Multer file upload errors
  if (error.name === "MulterError") {
    const multerError = error as any;
    if (multerError.code === "LIMIT_FILE_SIZE") {
      return ResponseHandler.badRequest(
        res,
        "File size exceeds the maximum allowed limit",
        { maxSize: multerError.limit }
      );
    }
    return ResponseHandler.badRequest(
      res,
      `File upload error: ${multerError.message}`,
      { code: multerError.code }
    );
  }

  // Handle database connection errors
  if (error.message?.includes("Can't reach database server")) {
    return ResponseHandler.serviceUnavailable(
      res,
      "Database connection failed. Please try again later."
    );
  }

  // Default to 500 Internal Server Error for unknown errors
  return ResponseHandler.internalError(
    res,
    process.env.NODE_ENV === "development"
      ? error.message
      : "An unexpected error occurred. Please try again later.",
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
