import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize notification content to prevent XSS attacks
 * 
 * Strips all HTML tags and attributes to ensure content is safe
 * Used for notification titles and messages before storing in database
 * 
 * @param content - Raw content string
 * @returns Sanitized content with all HTML removed
 * 
 * @example
 * sanitizeNotificationContent('<script>alert("xss")</script>Hello');
 * // Returns: 'Hello'
 */
export function sanitizeNotificationContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
  });
}

/**
 * Sanitize metadata object to prevent injection
 * 
 * Only allows primitive types (string, number, boolean)
 * Sanitizes string values and skips objects, arrays, functions
 * 
 * @param metadata - Raw metadata object
 * @returns Sanitized metadata with only safe primitive values
 * 
 * @example
 * sanitizeMetadata({
 *   testimonialId: 'abc123',
 *   count: 5,
 *   isPublic: true,
 *   nested: { bad: 'object' }, // Will be skipped
 *   script: '<script>alert("xss")</script>' // Will be sanitized
 * });
 * // Returns: { testimonialId: 'abc123', count: 5, isPublic: true, script: '' }
 */
export function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === 'string') {
      // Sanitize string values
      sanitized[key] = sanitizeNotificationContent(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      // Allow numbers and booleans as-is
      sanitized[key] = value;
    }
    // Skip objects, arrays, functions, null, undefined
  }
  
  return sanitized;
}

/**
 * Ensure sensitive environment variables are never logged
 * 
 * Checks if a string contains sensitive key patterns and masks them
 * Used in logging and error handling
 * 
 * @param text - Text that might contain sensitive data
 * @returns Text with sensitive data masked
 * 
 * @example
 * maskSensitiveData('ABLY_API_KEY=secret123');
 * // Returns: 'ABLY_API_KEY=***'
 */
export function maskSensitiveData(text: string): string {
  const sensitivePatterns = [
    /ABLY_API_KEY[=:]\s*\S+/gi,
    /RESEND_API_KEY[=:]\s*\S+/gi,
    /REDIS_URL[=:]\s*\S+/gi,
    /JWT_SECRET[=:]\s*\S+/gi,
    /DATABASE_URL[=:]\s*\S+/gi,
  ];

  let masked = text;
  for (const pattern of sensitivePatterns) {
    masked = masked.replace(pattern, (match) => {
      const [key] = match.split(/[=:]/);
      return `${key}=***`;
    });
  }

  return masked;
}
