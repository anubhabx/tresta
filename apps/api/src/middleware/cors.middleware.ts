import cors from "cors";
import type { Request, Response, NextFunction } from "express";

/**
 * CORS Middleware Configuration
 *
 * This file provides dynamic CORS middleware that checks the request path
 * and applies the appropriate CORS policy:
 * 1. Public CORS for widget embedding endpoints (any origin)
 * 2. Restrictive CORS for dashboard/management endpoints (frontend only)
 */

/**
 * Public paths that should allow any origin
 */
const PUBLIC_PATHS = [/^\/api\/public\//, /^\/api\/widgets\/[^\/]+\/public$/];

/**
 * Check if a path should use public CORS
 */
function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((pattern) => pattern.test(path));
}

/**
 * Restrictive CORS Configuration
 *
 * Used for authenticated endpoints (dashboard, project management, media uploads)
 * Only allows requests from the frontend application and admin panel
 * Supports credentials (cookies, authorization headers)
 */
const restrictiveCorsConfig = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.ADMIN_URL || "http://localhost:3001"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

/**
 * Public CORS Configuration
 *
 * Used for public widget embedding endpoints that need to be accessed from any external website
 * Allows requests from any origin (*)
 * Does not support credentials for security reasons
 * Only allows GET and OPTIONS methods (read-only)
 */
const publicCorsConfig = {
  origin: "*",
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  maxAge: 86400 // 24 hours
};

/**
 * Create CORS middleware instances
 */
const restrictiveCorsMiddleware = cors(restrictiveCorsConfig);
const publicCorsMiddleware = cors(publicCorsConfig);

/**
 * Dynamic CORS Middleware
 *
 * Checks the request path and applies appropriate CORS policy:
 * - Public endpoints: Allow any origin (*)
 * - Protected endpoints: Allow frontend URL only
 */
export function dynamicCors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const path = req.path;

  if (isPublicPath(path)) {
    // Apply public CORS (allow any origin)
    publicCorsMiddleware(req, res, next);
  } else {
    // Apply restrictive CORS (frontend only)
    restrictiveCorsMiddleware(req, res, next);
  }
}

/**
 * Export individual CORS middleware for manual use if needed
 */
export const restrictiveCors = restrictiveCorsMiddleware;
export const publicCors = publicCorsMiddleware;

/**
 * Webhook CORS Configuration
 *
 * Used for webhook endpoints (e.g., Clerk webhooks)
 * More restrictive than public endpoints but allows specific webhook origins
 */
export const webhookCors = cors({
  origin: [
    "https://clerk.com",
    "https://api.clerk.com",
    "https://clerk.dev",
    process.env.FRONTEND_URL || "http://localhost:3000"
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "svix-id",
    "svix-timestamp",
    "svix-signature"
  ],
  credentials: false
});
