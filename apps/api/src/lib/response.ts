import type { Response } from "express";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

/**
 * Pagination metadata structure
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Options for sending responses
 */
export interface ResponseOptions<T = any> {
  message?: string;
  data?: T;
  statusCode?: number;
  meta?: Partial<ApiResponse["meta"]>;
}

/**
 * Options for paginated responses
 */
export interface PaginatedResponseOptions<T = any> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  message?: string;
}

/**
 * Response Handler Class
 * Provides standardized methods for sending API responses
 */
export class ResponseHandler {
  /**
   * Send a successful response
   * @param res Express Response object
   * @param options Response options
   */
  static success<T>(res: Response, options: ResponseOptions<T> = {}): Response {
    const {
      message = "Request successful",
      data,
      statusCode = 200,
      meta = {}
    } = options;

    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a created (201) response
   * @param res Express Response object
   * @param options Response options
   */
  static created<T>(
    res: Response,
    options: Omit<ResponseOptions<T>, "statusCode"> = {}
  ): Response {
    return this.success(res, {
      ...options,
      message: options.message || "Resource created successfully",
      statusCode: 201
    });
  }

  /**
   * Send an updated (200) response
   * @param res Express Response object
   * @param options Response options
   */
  static updated<T>(
    res: Response,
    options: Omit<ResponseOptions<T>, "statusCode"> = {}
  ): Response {
    return this.success(res, {
      ...options,
      message: options.message || "Resource updated successfully",
      statusCode: 200
    });
  }

  /**
   * Send a deleted (200) response
   * @param res Express Response object
   * @param message Optional custom message
   */
  static deleted(res: Response, message?: string): Response {
    return this.success(res, {
      message: message || "Resource deleted successfully",
      statusCode: 200
    });
  }

  /**
   * Send a no content (204) response
   * @param res Express Response object
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a paginated response
   * @param res Express Response object
   * @param options Paginated response options
   */
  static paginated<T>(
    res: Response,
    options: PaginatedResponseOptions<T>
  ): Response {
    const { data, page, limit, total, message = "Request successful" } = options;

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const paginationMeta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage
    };

    return this.success(res, {
      message,
      data,
      meta: {
        pagination: paginationMeta
      }
    });
  }

  /**
   * Send an error response
   * @param res Express Response object
   * @param statusCode HTTP status code
   * @param message Error message
   * @param code Error code
   * @param details Additional error details
   */
  static error(
    res: Response,
    statusCode: number,
    message: string,
    code?: string,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code: code || `ERROR_${statusCode}`,
        message,
        details
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a bad request (400) error response
   * @param res Express Response object
   * @param message Error message
   * @param details Additional error details
   */
  static badRequest(
    res: Response,
    message: string = "Bad Request",
    details?: any
  ): Response {
    return this.error(res, 400, message, "BAD_REQUEST", details);
  }

  /**
   * Send an unauthorized (401) error response
   * @param res Express Response object
   * @param message Error message
   */
  static unauthorized(
    res: Response,
    message: string = "Unauthorized"
  ): Response {
    return this.error(res, 401, message, "UNAUTHORIZED");
  }

  /**
   * Send a forbidden (403) error response
   * @param res Express Response object
   * @param message Error message
   */
  static forbidden(res: Response, message: string = "Forbidden"): Response {
    return this.error(res, 403, message, "FORBIDDEN");
  }

  /**
   * Send a not found (404) error response
   * @param res Express Response object
   * @param message Error message
   */
  static notFound(res: Response, message: string = "Not Found"): Response {
    return this.error(res, 404, message, "NOT_FOUND");
  }

  /**
   * Send a conflict (409) error response
   * @param res Express Response object
   * @param message Error message
   * @param details Additional error details
   */
  static conflict(
    res: Response,
    message: string = "Conflict",
    details?: any
  ): Response {
    return this.error(res, 409, message, "CONFLICT", details);
  }

  /**
   * Send a validation error (422) response
   * @param res Express Response object
   * @param message Error message
   * @param validationErrors Validation error details
   */
  static validationError(
    res: Response,
    message: string = "Validation Error",
    validationErrors?: any
  ): Response {
    return this.error(
      res,
      422,
      message,
      "VALIDATION_ERROR",
      validationErrors
    );
  }

  /**
   * Send an internal server error (500) response
   * @param res Express Response object
   * @param message Error message
   */
  static internalError(
    res: Response,
    message: string = "Internal Server Error"
  ): Response {
    return this.error(res, 500, message, "INTERNAL_ERROR");
  }

  /**
   * Send a service unavailable (503) error response
   * @param res Express Response object
   * @param message Error message
   */
  static serviceUnavailable(
    res: Response,
    message: string = "Service Unavailable"
  ): Response {
    return this.error(res, 503, message, "SERVICE_UNAVAILABLE");
  }
}

/**
 * Helper function to extract pagination parameters from request query
 * @param query Request query object
 * @param defaults Default pagination values
 */
export function extractPaginationParams(
  query: any,
  defaults: { page?: number; limit?: number } = {}
): { page: number; limit: number } {
  const defaultPage = defaults.page || 1;
  const defaultLimit = defaults.limit || 10;
  const maxLimit = 100; // Prevent excessive queries

  const page = Math.max(1, parseInt(query.page as string, 10) || defaultPage);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit as string, 10) || defaultLimit)
  );

  return { page, limit };
}

/**
 * Helper function to calculate skip value for pagination
 * @param page Current page number
 * @param limit Items per page
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

// Export a singleton instance for convenience
export const respond = ResponseHandler;
