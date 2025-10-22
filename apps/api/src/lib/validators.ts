/**
 * Validation utilities for project controller
 */

/**
 * Validates a hex color code
 * @param color - Hex color string (e.g., "#FF5733" or "#FFF")
 * @returns boolean
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validates a URL format
 * @param url - URL string to validate
 * @returns boolean
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates slug format (lowercase alphanumeric with hyphens)
 * @param slug - Slug string to validate
 * @returns boolean
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Validates project type enum
 * @param type - Project type to validate
 * @returns boolean
 */
export function isValidProjectType(type: string): boolean {
  const validTypes = [
    "SAAS_APP",
    "PORTFOLIO",
    "MOBILE_APP",
    "CONSULTING_SERVICE",
    "E_COMMERCE",
    "AGENCY",
    "FREELANCE",
    "PRODUCT",
    "COURSE",
    "COMMUNITY",
    "OTHER",
  ];
  return validTypes.includes(type);
}

/**
 * Validates project visibility enum
 * @param visibility - Visibility to validate
 * @returns boolean
 */
export function isValidVisibility(visibility: string): boolean {
  const validVisibilities = ["PUBLIC", "PRIVATE", "INVITE_ONLY"];
  return validVisibilities.includes(visibility);
}

/**
 * Validates social links object structure and URLs
 * @param socialLinks - Social links object to validate
 * @returns { valid: boolean; errors: string[] }
 */
export function validateSocialLinks(socialLinks: any): {
  valid: boolean;
  errors: string[];
} {
  if (!socialLinks || typeof socialLinks !== "object") {
    return { valid: false, errors: ["Social links must be an object"] };
  }

  const errors: string[] = [];
  const allowedKeys = [
    "twitter",
    "linkedin",
    "github",
    "facebook",
    "instagram",
    "youtube",
    "website",
  ];

  for (const [key, value] of Object.entries(socialLinks)) {
    if (!allowedKeys.includes(key)) {
      errors.push(`Invalid social link key: ${key}`);
      continue;
    }

    if (typeof value !== "string" || !isValidUrl(value as string)) {
      errors.push(`Invalid URL for ${key}: ${value}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates tags array
 * @param tags - Array of tags to validate
 * @returns { valid: boolean; errors: string[] }
 */
export function validateTags(tags: any): {
  valid: boolean;
  errors: string[];
} {
  if (!Array.isArray(tags)) {
    return { valid: false, errors: ["Tags must be an array"] };
  }

  const errors: string[] = [];

  if (tags.length > 20) {
    errors.push("Maximum 20 tags allowed");
  }

  for (const tag of tags) {
    if (typeof tag !== "string") {
      errors.push(`Tag must be a string: ${tag}`);
      continue;
    }

    if (tag.length < 2) {
      errors.push(`Tag too short: ${tag}`);
    }

    if (tag.length > 50) {
      errors.push(`Tag too long (max 50 chars): ${tag}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
