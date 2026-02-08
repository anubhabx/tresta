/**
 * useSasUrl Hook
 *
 * Fetches SAS-enabled URLs for displaying images from private Azure Storage.
 * Caches results to avoid redundant API calls.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

// Cache for SAS URLs to avoid redundant API calls
const sasUrlCache = new Map<string, { url: string; expiresAt: number }>();

// Cache duration: 55 minutes (SAS tokens expire in 60 minutes)
const CACHE_DURATION_MS = 55 * 60 * 1000;

/**
 * Extract blob name from a full Azure blob URL
 * Example: https://account.blob.core.windows.net/container/logos/user_123/file.png
 * Returns: logos/user_123/file.png
 */
function extractBlobName(blobUrl: string): string | null {
  try {
    const url = new URL(blobUrl);
    // Path format: /container/blobName
    const pathParts = url.pathname.split("/");
    // Remove empty first element and container name
    if (pathParts.length >= 3) {
      return pathParts.slice(2).join("/");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is an Azure blob URL that needs a SAS token
 */
function isAzureBlobUrl(url: string): boolean {
  return url.includes(".blob.core.windows.net");
}

/**
 * Check if a URL already has a SAS token
 */
function hasSasToken(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.has("sig");
  } catch {
    return false;
  }
}

interface UseSasUrlResult {
  /** The SAS-enabled URL, or null if loading/error */
  sasUrl: string | null;
  /** Whether the SAS URL is being fetched */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Force refresh the SAS token */
  refresh: () => void;
}

/**
 * Hook to get a SAS-enabled URL for an Azure blob
 *
 * @param blobUrl - The blob URL stored in the database (without SAS token)
 * @returns Object with sasUrl, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * const { sasUrl, loading, error } = useSasUrl(project.logoUrl);
 *
 * if (loading) return <Skeleton />;
 * if (error) return <FallbackImage />;
 * return <img src={sasUrl} alt="Logo" />;
 * ```
 */
export function useSasUrl(blobUrl: string | undefined | null): UseSasUrlResult {
  const { getToken } = useAuth();
  const [sasUrl, setSasUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSasUrl = useCallback(
    async (forceRefresh = false) => {
      // No URL provided
      if (!blobUrl) {
        setSasUrl(null);
        setLoading(false);
        setError(null);
        return;
      }

      // Not an Azure blob URL - use as-is (local file, data URL, etc.)
      if (!isAzureBlobUrl(blobUrl)) {
        setSasUrl(blobUrl);
        setLoading(false);
        setError(null);
        return;
      }

      // Already has SAS token
      if (hasSasToken(blobUrl)) {
        setSasUrl(blobUrl);
        setLoading(false);
        setError(null);
        return;
      }

      // Check cache
      const cached = sasUrlCache.get(blobUrl);
      if (cached && !forceRefresh && cached.expiresAt > Date.now()) {
        setSasUrl(cached.url);
        setLoading(false);
        setError(null);
        return;
      }

      // Extract blob name
      const blobName = extractBlobName(blobUrl);
      if (!blobName) {
        setError("Invalid blob URL format");
        setLoading(false);
        return;
      }

      // Fetch SAS URL from API
      setLoading(true);
      setError(null);

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const authToken = await getToken();
        if (!authToken) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/media/generate-read-url`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ blobName }),
            signal: abortControllerRef.current.signal,
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || "Failed to generate read URL",
          );
        }

        const { data } = await response.json();
        const newSasUrl = data.url;

        // Cache the result
        sasUrlCache.set(blobUrl, {
          url: newSasUrl,
          expiresAt: Date.now() + CACHE_DURATION_MS,
        });

        setSasUrl(newSasUrl);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled, don't update state
          return;
        }
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load image";
        setError(errorMessage);
        setSasUrl(null);
      } finally {
        setLoading(false);
      }
    },
    [blobUrl, getToken],
  );

  // Fetch on mount and when URL changes
  useEffect(() => {
    fetchSasUrl();

    return () => {
      // Cleanup: abort pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSasUrl]);

  const refresh = useCallback(() => {
    fetchSasUrl(true);
  }, [fetchSasUrl]);

  return { sasUrl, loading, error, refresh };
}

/**
 * Utility function to get a SAS URL (non-hook version for one-off use)
 */
export async function getSasUrl(
  blobUrl: string,
  authToken: string,
): Promise<string> {
  if (!isAzureBlobUrl(blobUrl) || hasSasToken(blobUrl)) {
    return blobUrl;
  }

  // Check cache
  const cached = sasUrlCache.get(blobUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const blobName = extractBlobName(blobUrl);
  if (!blobName) {
    throw new Error("Invalid blob URL format");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/media/generate-read-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ blobName }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to generate read URL");
  }

  const { data } = await response.json();

  // Cache the result
  sasUrlCache.set(blobUrl, {
    url: data.url,
    expiresAt: Date.now() + CACHE_DURATION_MS,
  });

  return data.url;
}

/**
 * Clear the SAS URL cache (useful for logout/session changes)
 */
export function clearSasUrlCache(): void {
  sasUrlCache.clear();
}
