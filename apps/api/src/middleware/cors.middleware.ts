import cors from "cors";

/**
 * CORS Middleware Configuration
 *
 * This file provides two CORS configurations:
 * 1. Restrictive CORS for authenticated dashboard/management endpoints
 * 2. Open CORS for public widget embedding endpoints
 */

/**
 * Restrictive CORS Configuration
 *
 * Used for authenticated endpoints (dashboard, project management, media uploads)
 * Only allows requests from the frontend application
 * Supports credentials (cookies, authorization headers)
 */
export const restrictiveCors = cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

/**
 * Public CORS Configuration
 *
 * Used for public widget embedding endpoints that need to be accessed from any external website
 * Allows requests from any origin (*)
 * Does not support credentials for security reasons
 * Only allows GET and OPTIONS methods (read-only)
 *
 * Applied to:
 * - /api/public/* (public project/testimonial data)
 * - /api/widgets/:widgetId/public (widget data for embedding)
 */
export const publicCors = cors({
  origin: "*",
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  // Optional: Add cache control for preflight requests
  maxAge: 86400, // 24 hours
});

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
    process.env.FRONTEND_URL || "http://localhost:3000",
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "svix-id", "svix-timestamp", "svix-signature"],
  credentials: false,
});
