/**
 * Central Zod validation schemas — single source of truth for all request validation.
 *
 * Enum schemas are derived from Prisma-generated types via z.nativeEnum() so they
 * automatically stay in sync with the database schema without manual duplication.
 */

import { z } from "zod";
import {
  ProjectType,
  ProjectVisibility,
  TestimonialType,
} from "@workspace/database/prisma";

// ─── Primitive helpers ───────────────────────────────────────────────────────

export const HexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color (e.g. #FF5733 or #FFF)",
  });

export const UrlSchema = z.string().url({ message: "Must be a valid URL" });

export const SlugSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  });

// ─── Enum schemas (derived from Prisma — no manual string arrays) ─────────────

export const ProjectTypeSchema = z.nativeEnum(ProjectType);
export const ProjectVisibilitySchema = z.nativeEnum(ProjectVisibility);
export const TestimonialTypeSchema = z.nativeEnum(TestimonialType);

// ─── Compound field schemas ───────────────────────────────────────────────────

export const SocialLinksSchema = z
  .object({
    twitter: UrlSchema.optional(),
    linkedin: UrlSchema.optional(),
    github: UrlSchema.optional(),
    facebook: UrlSchema.optional(),
    instagram: UrlSchema.optional(),
    youtube: UrlSchema.optional(),
    website: UrlSchema.optional(),
  })
  .strict({ message: "Unknown social link platform provided" });

export const TagsSchema = z
  .array(
    z.string().min(2, "Tag too short").max(50, "Tag too long (max 50 chars)"),
  )
  .max(20, "Maximum 20 tags allowed");

// ─── Request body schemas ─────────────────────────────────────────────────────

// Core project fields (create + update share the same field set)
const ProjectBaseSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255),
  slug: SlugSchema,
  shortDescription: z.string().max(500).optional(),
  description: z.string().max(10000).optional(),
  logoUrl: UrlSchema.optional().or(z.literal("")),
  projectType: ProjectTypeSchema.optional(),
  websiteUrl: UrlSchema.optional().or(z.literal("")),
  collectionFormUrl: UrlSchema.optional().or(z.literal("")),
  brandColorPrimary: HexColorSchema.optional(),
  brandColorSecondary: HexColorSchema.optional(),
  socialLinks: SocialLinksSchema.optional(),
  tags: TagsSchema.optional(),
  visibility: ProjectVisibilitySchema.optional(),
  formConfig: z.record(z.unknown()).optional(),

  // Moderation / settings (only relevant in update)
  isActive: z.boolean().optional(),
  autoModeration: z.boolean().optional(),
  autoApproveVerified: z.boolean().optional(),
  profanityFilterLevel: z.enum(["STRICT", "MODERATE", "LENIENT"]).optional(),
  moderationSettings: z
    .object({
      minContentLength: z.number().min(0).max(1000).optional(),
      maxContentLength: z.number().min(1).max(50000).optional(),
      maxUrlCount: z.number().min(0).max(10).optional(),
      requireApproval: z.boolean().optional(),
      blockedKeywords: z.array(z.string()).optional(),
      blockedDomains: z.array(z.string()).optional(),
      allowedDomains: z.array(z.string()).optional(),
      customProfanityList: z.array(z.string()).optional(),
      brandKeywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export const CreateProjectSchema = ProjectBaseSchema.pick({
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  logoUrl: true,
  projectType: true,
  websiteUrl: true,
  collectionFormUrl: true,
  brandColorPrimary: true,
  brandColorSecondary: true,
  socialLinks: true,
  tags: true,
  visibility: true,
  formConfig: true,
});

export const UpdateProjectSchema = ProjectBaseSchema.partial();

export const ApiKeyCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  permissions: z.record(z.boolean()).optional(),
  rateLimit: z.number().int().min(1).max(10_000).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  projectId: z.string().optional().nullable(),
  scopes: z.array(z.string()).optional(),
});

export const ApiKeyUpdateSchema = ApiKeyCreateSchema.partial();

// Export helper to extract a Zod error message list
export function zodErrorDetails(
  error: z.ZodError,
): { field: string; message: string }[] {
  return error.errors.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
