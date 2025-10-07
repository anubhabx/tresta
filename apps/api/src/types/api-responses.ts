/**
 * API Response Type Definitions
 * Provides TypeScript types for API responses to improve type safety
 * across the frontend and backend
 */

/**
 * Base API Response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiErrorResponse;
  meta?: ApiResponseMeta;
}

/**
 * API Error Response structure
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: any;
}

/**
 * API Response Metadata
 */
export interface ApiResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

/**
 * Pagination Metadata
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
 * Common API error codes
 */
export enum ApiErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
}

/**
 * HTTP Status Codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

/**
 * Generic Success Response type
 */
export type SuccessResponse<T> = Required<
  Pick<ApiResponse<T>, "success" | "message" | "data" | "meta">
> & {
  success: true;
};

/**
 * Generic Error Response type
 */
export type ErrorResponse = Required<
  Pick<ApiResponse, "success" | "error" | "meta">
> & {
  success: false;
};

/**
 * Paginated Response type
 */
export type PaginatedResponse<T> = SuccessResponse<T[]> & {
  meta: ApiResponseMeta & {
    pagination: PaginationMeta;
  };
};

// Example usage types for common entities

/**
 * Project entity response types
 */
export interface ProjectData {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    testimonials: number;
  };
}

export type ProjectResponse = SuccessResponse<ProjectData>;
export type ProjectListResponse = PaginatedResponse<ProjectData>;
export type ProjectCreatedResponse = SuccessResponse<ProjectData>;
export type ProjectUpdatedResponse = SuccessResponse<ProjectData>;

/**
 * Testimonial entity response types (for future use)
 */
export interface TestimonialData {
  id: string;
  userId: string | null;
  projectId: string | null;
  authorName: string;
  authorEmail: string | null;
  content: string;
  type: "TEXT" | "VIDEO" | "AUDIO";
  rating: number | null;
  isPublished: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TestimonialResponse = SuccessResponse<TestimonialData>;
export type TestimonialListResponse = PaginatedResponse<TestimonialData>;

/**
 * Validation error details type
 */
export interface ValidationErrorDetails {
  [field: string]: string | string[];
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse
): response is ErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if response is paginated
 */
export function isPaginatedResponse<T>(
  response: ApiResponse<T[]>
): response is PaginatedResponse<T> {
  return (
    response.success === true &&
    response.meta !== undefined &&
    "pagination" in response.meta
  );
}
