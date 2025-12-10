import { Prisma } from "@workspace/database/prisma";

/**
 * Base class for all API errors.
 * Includes a status code to be sent in the HTTP response.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || `ERROR_${statusCode}`;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    // Necessary for custom errors to work correctly with `instanceof`.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents a 400 Bad Request error.
 */
export class BadRequestError extends ApiError {
  constructor(message = "Bad Request", details?: any) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

/**
 * Represents a 401 Unauthorized error.
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", details?: any) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

/**
 * Represents a 403 Forbidden error.
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", details?: any) {
    super(message, 403, "FORBIDDEN", details);
  }
}

/**
 * Represents a 404 Not Found error.
 */
export class NotFoundError extends ApiError {
  constructor(message = "Not Found", details?: any) {
    super(message, 404, "NOT_FOUND", details);
  }
}

/**
 * Represents a 409 Conflict error.
 */
export class ConflictError extends ApiError {
  constructor(message = "Conflict", details?: any) {
    super(message, 409, "CONFLICT", details);
  }
}

/**
 * Represents a 422 Unprocessable Entity error (validation errors).
 */
export class ValidationError extends ApiError {
  constructor(message = "Validation failed", details?: any) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

/**
 * Represents a 429 Too Many Requests error (rate limiting).
 */
export class RateLimitError extends ApiError {
  constructor(message = "Too many requests", details?: any) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", details);
  }
}

/**
 * Represents a 500 Internal Server Error.
 */
export class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error", details?: any) {
    super(message, 500, "INTERNAL_ERROR", details);
  }
}

/**
 * Represents a 503 Service Unavailable error.
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = "Service temporarily unavailable", details?: any) {
    super(message, 503, "SERVICE_UNAVAILABLE", details);
  }
}

/**
 * Handles Prisma-specific errors and maps them to ApiError instances.
 * @param error The error thrown by Prisma.
 * @returns An instance of ApiError.
 */
export function handlePrismaError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint violation
        const fields = (error.meta?.target as string[])?.join(", ");
        return new ConflictError(
          `A record with this ${fields || "value"} already exists.`,
          { prismaCode: error.code, fields }
        );

      case "P2025": // Record to update not found
        return new NotFoundError(
          (error.meta?.cause as string) || "Record not found.",
          { prismaCode: error.code }
        );

      case "P2003": // Foreign key constraint failed
        return new BadRequestError(
          "Cannot perform this operation due to related records.",
          { prismaCode: error.code, field: error.meta?.field_name }
        );

      case "P2014": // Relation violation
        return new BadRequestError(
          "The change you are trying to make would violate a required relation.",
          { prismaCode: error.code }
        );

      case "P2015": // Related record not found
        return new NotFoundError(
          "A related record could not be found.",
          { prismaCode: error.code }
        );

      case "P2016": // Query interpretation error
        return new BadRequestError(
          "Query interpretation error. Please check your request.",
          { prismaCode: error.code }
        );

      case "P2021": // Table does not exist
        return new InternalServerError(
          "Database configuration error.",
          { prismaCode: error.code }
        );

      case "P2022": // Column does not exist
        return new InternalServerError(
          "Database schema error.",
          { prismaCode: error.code }
        );

      default:
        // Fallback for other known Prisma errors
        return new BadRequestError(
          "Database request failed.",
          { prismaCode: error.code, message: error.message }
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError(
      "Invalid data provided to database.",
      { type: "prisma_validation" }
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new ServiceUnavailableError(
      "Database connection failed.",
      { type: "database_connection" }
    );
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new InternalServerError(
      "Critical database error occurred.",
      { type: "database_panic" }
    );
  }

  // Fallback for unknown errors
  console.error("Unknown API Error:", error);
  return new InternalServerError(
    "An unexpected error occurred.",
    { type: "unknown_error", originalError: process.env.NODE_ENV === 'development' ? error.message : undefined }
  );
}
