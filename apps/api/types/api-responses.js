/**
 * Common API error codes
 */
export var ApiErrorCode;
(function (ApiErrorCode) {
    ApiErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ApiErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ApiErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ApiErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ApiErrorCode["CONFLICT"] = "CONFLICT";
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
})(ApiErrorCode || (ApiErrorCode = {}));
/**
 * HTTP Status Codes
 */
export var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(HttpStatus || (HttpStatus = {}));
/**
 * Project types and enums
 */
export var ProjectType;
(function (ProjectType) {
    ProjectType["SAAS_APP"] = "SAAS_APP";
    ProjectType["PORTFOLIO"] = "PORTFOLIO";
    ProjectType["MOBILE_APP"] = "MOBILE_APP";
    ProjectType["CONSULTING_SERVICE"] = "CONSULTING_SERVICE";
    ProjectType["E_COMMERCE"] = "E_COMMERCE";
    ProjectType["AGENCY"] = "AGENCY";
    ProjectType["FREELANCE"] = "FREELANCE";
    ProjectType["PRODUCT"] = "PRODUCT";
    ProjectType["COURSE"] = "COURSE";
    ProjectType["COMMUNITY"] = "COMMUNITY";
    ProjectType["OTHER"] = "OTHER";
})(ProjectType || (ProjectType = {}));
export var ProjectVisibility;
(function (ProjectVisibility) {
    ProjectVisibility["PUBLIC"] = "PUBLIC";
    ProjectVisibility["PRIVATE"] = "PRIVATE";
    ProjectVisibility["INVITE_ONLY"] = "INVITE_ONLY";
})(ProjectVisibility || (ProjectVisibility = {}));
/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse(response) {
    return response.success === true;
}
/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(response) {
    return response.success === false;
}
/**
 * Type guard to check if response is paginated
 */
export function isPaginatedResponse(response) {
    return (response.success === true &&
        response.meta !== undefined &&
        "pagination" in response.meta);
}
/**
 * Widget types and enums
 */
export var WidgetType;
(function (WidgetType) {
    WidgetType["GRID"] = "GRID";
    WidgetType["CAROUSEL"] = "CAROUSEL";
    WidgetType["MASONRY"] = "MASONRY";
    WidgetType["LIST"] = "LIST";
    WidgetType["SINGLE"] = "SINGLE";
})(WidgetType || (WidgetType = {}));
export var WidgetTheme;
(function (WidgetTheme) {
    WidgetTheme["LIGHT"] = "LIGHT";
    WidgetTheme["DARK"] = "DARK";
    WidgetTheme["AUTO"] = "AUTO";
})(WidgetTheme || (WidgetTheme = {}));
