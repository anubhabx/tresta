import type { WidgetConfig } from "@workspace/types";
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
export declare enum ApiErrorCode {
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
export declare enum HttpStatus {
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
export type SuccessResponse<T> = Required<Pick<ApiResponse<T>, "success" | "message" | "data" | "meta">> & {
    success: true;
};
/**
 * Generic Error Response type
 */
export type ErrorResponse = Required<Pick<ApiResponse, "success" | "error" | "meta">> & {
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
/**
 * Project types and enums
 */
export declare enum ProjectType {
    SAAS_APP = "SAAS_APP",
    PORTFOLIO = "PORTFOLIO",
    MOBILE_APP = "MOBILE_APP",
    CONSULTING_SERVICE = "CONSULTING_SERVICE",
    E_COMMERCE = "E_COMMERCE",
    AGENCY = "AGENCY",
    FREELANCE = "FREELANCE",
    PRODUCT = "PRODUCT",
    COURSE = "COURSE",
    COMMUNITY = "COMMUNITY",
    OTHER = "OTHER"
}
export declare enum ProjectVisibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    INVITE_ONLY = "INVITE_ONLY"
}
export interface SocialLinks {
    twitter?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    [key: string]: string | undefined;
}
/**
 * Project entity response types
 */
export interface ProjectData {
    id: string;
    userId: string;
    name: string;
    shortDescription: string | null;
    description: string | null;
    slug: string;
    logoUrl: string | null;
    projectType: ProjectType | null;
    websiteUrl: string | null;
    collectionFormUrl: string | null;
    brandColorPrimary: string | null;
    brandColorSecondary: string | null;
    socialLinks: SocialLinks | null;
    tags: string[];
    visibility: ProjectVisibility;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        testimonials: number;
        widgets?: number;
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
export declare function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T>;
/**
 * Type guard to check if response is an error
 */
export declare function isErrorResponse(response: ApiResponse): response is ErrorResponse;
/**
 * Type guard to check if response is paginated
 */
export declare function isPaginatedResponse<T>(response: ApiResponse<T[]>): response is PaginatedResponse<T>;
/**
 * Project payload types for create/update operations
 */
export interface CreateProjectPayload {
    name: string;
    shortDescription?: string;
    description?: string;
    slug: string;
    logoUrl?: string;
    projectType?: ProjectType;
    websiteUrl?: string;
    collectionFormUrl?: string;
    brandColorPrimary?: string;
    brandColorSecondary?: string;
    socialLinks?: SocialLinks;
    tags?: string[];
    visibility?: ProjectVisibility;
}
export interface UpdateProjectPayload {
    name?: string;
    shortDescription?: string;
    description?: string;
    slug?: string;
    logoUrl?: string;
    projectType?: ProjectType;
    websiteUrl?: string;
    collectionFormUrl?: string;
    brandColorPrimary?: string;
    brandColorSecondary?: string;
    socialLinks?: SocialLinks;
    tags?: string[];
    visibility?: ProjectVisibility;
    isActive?: boolean;
    autoModeration?: boolean;
    autoApproveVerified?: boolean;
    profanityFilterLevel?: "STRICT" | "MODERATE" | "LENIENT";
    moderationSettings?: {
        minContentLength?: number;
        maxUrlCount?: number;
        allowedDomains?: string[];
        blockedDomains?: string[];
        customProfanityList?: string[];
        brandKeywords?: string[];
    };
}
/**
 * Widget types and enums
 */
export declare enum WidgetType {
    GRID = "GRID",
    CAROUSEL = "CAROUSEL",
    MASONRY = "MASONRY",
    LIST = "LIST",
    SINGLE = "SINGLE"
}
export declare enum WidgetTheme {
    LIGHT = "LIGHT",
    DARK = "DARK",
    AUTO = "AUTO"
}
/**
 * Widget entity response types
 */
export interface WidgetData {
    id: string;
    projectId?: string;
    config: WidgetConfig;
    createdAt: string;
    updatedAt: string;
    project?: Pick<ProjectData, "id" | "name" | "slug" | "brandColorPrimary" | "brandColorSecondary">;
}
export type WidgetResponse = SuccessResponse<WidgetData>;
export type WidgetListResponse = PaginatedResponse<WidgetData>;
export type WidgetCreatedResponse = SuccessResponse<WidgetData>;
export type WidgetUpdatedResponse = SuccessResponse<WidgetData>;
/**
 * Widget payload types for create/update operations
 */
export interface CreateWidgetPayload {
    projectId: string;
    config: WidgetConfig;
}
export interface UpdateWidgetPayload {
    config?: Partial<WidgetConfig>;
}
/**
 * Widget public data for embed display
 */
export interface WidgetPublicData {
    id: string;
    projectId: string;
    config: WidgetConfig;
    createdAt: string;
    updatedAt: string;
    testimonials: TestimonialData[];
    project: Pick<ProjectData, "id" | "name" | "slug" | "logoUrl" | "brandColorPrimary" | "brandColorSecondary">;
}
export type WidgetPublicResponse = SuccessResponse<WidgetPublicData>;
//# sourceMappingURL=api-responses.d.ts.map