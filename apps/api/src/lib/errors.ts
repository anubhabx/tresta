import { Prisma } from "@workspace/database/prisma";
/**
 * Base class for all API errors.
 * Includes a status code to be sent in the HTTP response.
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
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
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

/**
 * Represents a 401 Unauthorized error.
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * Represents a 403 Forbidden error.
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/**
 * Represents a 404 Not Found error.
 */
export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

/**
 * Represents a 409 Conflict error.
 */
export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

/**
 * Represents a 500 Internal Server Error.
 */
export class InternalServerError extends ApiError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

/**
 * Handles Prisma-specific errors and maps them to ApiError instances.
 * @param error The error thrown by Prisma.
 * @returns An instance of ApiError.
 */
export function handlePrismaError(error: unknown): ApiError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint violation
        const fields = (error.meta?.target as string[])?.join(", ");
        return new ConflictError(
          `A record with this ${fields || "value"} already exists.`
        );
      case "P2025": // Record to update not found
        return new NotFoundError(
          (error.meta?.cause as string) || "Record not found."
        );
      default:
        // Fallback for other known Prisma errors
        return new BadRequestError("Database request failed.");
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError("Invalid data provided.");
  }

  // Fallback for unknown errors
  return new InternalServerError("An unexpected database error occurred.");
}
