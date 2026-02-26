import * as z from "zod";
import type { FormConfig } from "@/types/api";

/**
 * Form config settings validation schema
 */
export const formConfigSchema = z
  .object({
    // Custom text
    headerTitle: z
      .string()
      .max(200, "Header title must be less than 200 characters")
      .optional()
      .or(z.literal("")),
    headerDescription: z
      .string()
      .max(500, "Header description must be less than 500 characters")
      .optional()
      .or(z.literal("")),
    thankYouMessage: z
      .string()
      .max(500, "Thank you message must be less than 500 characters")
      .optional()
      .or(z.literal("")),

    // Field visibility toggles
    enableRating: z.boolean(),
    enableJobTitle: z.boolean(),
    enableCompany: z.boolean(),
    enableAvatar: z.boolean(),
    enableVideoUrl: z.boolean(),
    enableGoogleVerification: z.boolean(),

    // Field requirements
    requireRating: z.boolean(),
    requireJobTitle: z.boolean(),
    requireCompany: z.boolean(),
    requireAvatar: z.boolean(),
    requireVideoUrl: z.boolean(),
    requireGoogleVerification: z.boolean(),

    // Submission behavior and notifications
    allowAnonymousSubmissions: z.boolean(),
    notifyOnSubmission: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.enableRating && data.requireRating) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requireRating"],
        message: "Rating cannot be required when rating is disabled",
      });
    }

    if (!data.enableJobTitle && data.requireJobTitle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requireJobTitle"],
        message: "Job title cannot be required when the field is disabled",
      });
    }

    if (!data.enableCompany && data.requireCompany) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requireCompany"],
        message: "Company cannot be required when the field is disabled",
      });
    }

    if (!data.enableAvatar && data.requireAvatar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requireAvatar"],
        message: "Avatar cannot be required when uploads are disabled",
      });
    }

    if (!data.enableVideoUrl && data.requireVideoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requireVideoUrl"],
        message: "Video URL cannot be required when the field is disabled",
      });
    }

    if (!data.enableGoogleVerification && data.requireGoogleVerification) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requireGoogleVerification"],
        message:
          "Google verification cannot be required when it is disabled",
      });
    }
  });

export type FormConfigFormData = z.infer<typeof formConfigSchema>;

/**
 * Default form config values (all fields enabled, nothing required)
 */
export const defaultFormConfig: FormConfigFormData = {
  headerTitle: "",
  headerDescription: "",
  thankYouMessage: "",
  enableRating: true,
  enableJobTitle: true,
  enableCompany: true,
  enableAvatar: true,
  enableVideoUrl: true,
  enableGoogleVerification: true,
  requireRating: false,
  requireJobTitle: false,
  requireCompany: false,
  requireAvatar: false,
  requireVideoUrl: false,
  requireGoogleVerification: false,
  allowAnonymousSubmissions: true,
  notifyOnSubmission: true,
};

/**
 * Convert form data to API payload format
 */
export function convertFormConfigToPayload(
  data: FormConfigFormData,
): FormConfig {
  return {
    headerTitle: data.headerTitle || undefined,
    headerDescription: data.headerDescription || undefined,
    thankYouMessage: data.thankYouMessage || undefined,
    enableRating: data.enableRating,
    enableJobTitle: data.enableJobTitle,
    enableCompany: data.enableCompany,
    enableAvatar: data.enableAvatar,
    enableVideoUrl: data.enableVideoUrl,
    enableGoogleVerification: data.enableGoogleVerification,
    requireRating: data.requireRating,
    requireJobTitle: data.requireJobTitle,
    requireCompany: data.requireCompany,
    requireAvatar: data.requireAvatar,
    requireVideoUrl: data.requireVideoUrl,
    requireGoogleVerification: data.requireGoogleVerification,
    allowAnonymousSubmissions: data.allowAnonymousSubmissions,
    notifyOnSubmission: data.notifyOnSubmission,
  };
}

/**
 * Convert API data to form format
 */
export function convertFormConfigToForm(
  formConfig?: FormConfig | null,
): FormConfigFormData {
  if (!formConfig) return { ...defaultFormConfig };

  return {
    headerTitle: formConfig.headerTitle ?? "",
    headerDescription: formConfig.headerDescription ?? "",
    thankYouMessage: formConfig.thankYouMessage ?? "",
    enableRating: formConfig.enableRating ?? true,
    enableJobTitle: formConfig.enableJobTitle ?? true,
    enableCompany: formConfig.enableCompany ?? true,
    enableAvatar: formConfig.enableAvatar ?? true,
    enableVideoUrl: formConfig.enableVideoUrl ?? true,
    enableGoogleVerification: formConfig.enableGoogleVerification ?? true,
    requireRating: formConfig.requireRating ?? false,
    requireJobTitle: formConfig.requireJobTitle ?? false,
    requireCompany: formConfig.requireCompany ?? false,
    requireAvatar: formConfig.requireAvatar ?? false,
    requireVideoUrl: formConfig.requireVideoUrl ?? false,
    requireGoogleVerification: formConfig.requireGoogleVerification ?? false,
    allowAnonymousSubmissions: formConfig.allowAnonymousSubmissions ?? true,
    notifyOnSubmission: formConfig.notifyOnSubmission ?? true,
  };
}
