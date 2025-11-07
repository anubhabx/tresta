import * as z from "zod";
import { ProjectType, ProjectVisibility } from "@/types/api";

/**
 * Project form validation schema
 */
export const projectFormSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Project name must be less than 255 characters"),
  shortDescription: z
    .string()
    .max(500, "Short description must be less than 500 characters")
    .optional(),
  description: z
    .string()
    .max(10000, "Description must be less than 10,000 characters")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  projectType: z.nativeEnum(ProjectType).optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  collectionFormUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  brandColorPrimary: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional()
    .or(z.literal("")),
  brandColorSecondary: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional()
    .or(z.literal("")),
  visibility: z.nativeEnum(ProjectVisibility).optional(),
  // Social links as separate fields
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  youtube: z.string().url("Invalid URL").optional().or(z.literal("")),
  // Tags as comma-separated string
  tagsInput: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

/**
 * Generate a URL-safe slug from a project name
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};
