/**
 * SasImage Component
 *
 * Image component that automatically handles SAS token fetching for Azure Storage.
 * Drop-in replacement for <img> when displaying images from private Azure Storage.
 */

"use client";

import * as React from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import { useSasUrl } from "@/hooks/use-sas-url";

interface SasImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  /** The blob URL (with or without SAS token) */
  src: string | undefined | null;
  /** Alt text for the image */
  alt: string;
  /** Optional fallback content when image fails to load */
  fallback?: React.ReactNode;
  /** Optional skeleton className for loading state */
  skeletonClassName?: string;
  /** Whether to show loading skeleton */
  showSkeleton?: boolean;
}

/**
 * SasImage - Image component with automatic SAS token handling
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SasImage src={project.logoUrl} alt="Project Logo" className="h-10 w-10" />
 *
 * // With fallback
 * <SasImage
 *   src={user.avatarUrl}
 *   alt="Avatar"
 *   fallback={<UserIcon className="h-10 w-10" />}
 * />
 * ```
 */
export function SasImage({
  src,
  alt,
  fallback,
  className,
  skeletonClassName,
  showSkeleton = true,
  ...props
}: SasImageProps) {
  const { sasUrl, loading, error } = useSasUrl(src);
  const [imageError, setImageError] = React.useState(false);

  // Reset image error when src changes
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  // No source provided
  if (!src) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  // Loading state
  if (loading && showSkeleton) {
    return (
      <Skeleton className={cn("bg-muted", skeletonClassName || className)} />
    );
  }

  // Error state - show fallback
  if (error || imageError || !sasUrl) {
    if (fallback) return <>{fallback}</>;

    // Default fallback: subtle placeholder
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <svg
          className="h-1/2 w-1/2 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Success - render image
  return (
    <img
      src={sasUrl}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
      {...props}
    />
  );
}

export default SasImage;
