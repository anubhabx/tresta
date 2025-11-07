import * as z from "zod";

/**
 * Moderation settings form validation schema
 */
export const moderationSettingsFormSchema = z.object({
  // Core auto-moderation toggles
  autoModeration: z.boolean(),
  autoApproveVerified: z.boolean(),

  // Profanity filter level
  profanityFilterLevel: z.enum(["STRICT", "MODERATE", "LENIENT"]),

  // Advanced moderation settings
  minContentLength: z.number().int().min(0).max(1000).optional(),
  maxUrlCount: z.number().int().min(0).max(10).optional(),

  // Domain management (comma-separated inputs)
  allowedDomainsInput: z.string().optional(),
  blockedDomainsInput: z.string().optional(),

  // Custom profanity list (comma-separated)
  customProfanityInput: z.string().optional(),

  // Brand keywords for spam detection (comma-separated)
  brandKeywordsInput: z.string().optional(),
});

export type ModerationSettingsFormData = z.infer<
  typeof moderationSettingsFormSchema
>;

/**
 * Convert form data to API payload format
 */
export function convertModerationFormToPayload(
  data: ModerationSettingsFormData,
) {
  // Helper to split comma-separated strings into arrays
  const splitAndTrim = (input?: string): string[] => {
    if (!input || input.trim() === "") return [];
    return input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  return {
    autoModeration: data.autoModeration,
    autoApproveVerified: data.autoApproveVerified,
    profanityFilterLevel: data.profanityFilterLevel,
    moderationSettings: {
      minContentLength: data.minContentLength,
      maxUrlCount: data.maxUrlCount,
      allowedDomains: splitAndTrim(data.allowedDomainsInput),
      blockedDomains: splitAndTrim(data.blockedDomainsInput),
      customProfanityList: splitAndTrim(data.customProfanityInput),
      brandKeywords: splitAndTrim(data.brandKeywordsInput),
    },
  };
}

/**
 * Convert API data to form format
 */
export function convertModerationPayloadToForm(
  project: any,
): ModerationSettingsFormData {
  const settings = project.moderationSettings || {};

  // Helper to join arrays into comma-separated strings
  const joinArray = (arr?: string[]): string => {
    if (!arr || arr.length === 0) return "";
    return arr.join(", ");
  };

  return {
    autoModeration: project.autoModeration ?? true,
    autoApproveVerified: project.autoApproveVerified ?? false,
    profanityFilterLevel:
      (project.profanityFilterLevel as "STRICT" | "MODERATE" | "LENIENT") ||
      "MODERATE",
    minContentLength: settings.minContentLength,
    maxUrlCount: settings.maxUrlCount,
    allowedDomainsInput: joinArray(settings.allowedDomains),
    blockedDomainsInput: joinArray(settings.blockedDomains),
    customProfanityInput: joinArray(settings.customProfanityList),
    brandKeywordsInput: joinArray(settings.brandKeywords),
  };
}
