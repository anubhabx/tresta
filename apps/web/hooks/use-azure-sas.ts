"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

export const UploadDirectory = {
  LOGOS: "logos",
  TESTIMONIALS: "testimonials",
  AVATARS: "avatars",
  VIDEOS: "videos",
  IMAGES: "images",
  DOCUMENTS: "documents",
} as const;

export type UploadDirectory =
  (typeof UploadDirectory)[keyof typeof UploadDirectory];

interface GenerateUploadUrlRequest {
  filename: string;
  contentType: string;
  directory: UploadDirectory;
  fileSize?: number;
}

interface GenerateUploadUrlResponse {
  uploadUrl: string;
  blobUrl: string;
  blobName: string;
  expiresAt: string;
}

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export interface UploadResult {
  blobUrl: string;
  blobName: string;
}

/**
 * Upload a file to Azure Blob Storage using SAS URL
 */
async function uploadToAzure(
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(
            `Upload failed with status ${xhr.status}: ${xhr.statusText}`,
          ),
        );
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    // Configure and send request
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

/**
 * React Hook for Azure Blob Storage uploads with SAS URLs
 *
 * @example
 * ```tsx
 * const { uploadFile, uploading, progress, error } = useAzureSAS();
 *
 * const handleUpload = async (file: File) => {
 *   const result = await uploadFile(file, UploadDirectory.LOGOS);
 *   if (result) {
 *     console.log('Uploaded to:', result.blobUrl);
 *   }
 * };
 * ```
 */
export function useAzureSAS() {
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a file to Azure Blob Storage
   */
  const uploadFile = useCallback(
    async (
      file: File,
      directory: UploadDirectory,
      options?: UploadOptions,
    ): Promise<UploadResult | null> => {
      try {
        setUploading(true);
        setProgress(0);
        setError(null);

        // Get authentication token
        const authToken = await getToken();
        if (!authToken) {
          throw new Error("Authentication required");
        }

        // Step 1: Request upload URL from backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/media/generate-upload-url`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              directory,
              fileSize: file.size,
            } as GenerateUploadUrlRequest),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to generate upload URL",
          );
        }

        const { data } = await response.json();
        const uploadData = data as GenerateUploadUrlResponse;

        // Step 2: Upload file directly to Azure using SAS URL
        await uploadToAzure(file, uploadData.uploadUrl, (progressValue) => {
          setProgress(progressValue);
          options?.onProgress?.(progressValue);
        });

        // Step 3: Return the result
        const result: UploadResult = {
          blobUrl: uploadData.blobUrl,
          blobName: uploadData.blobName,
        };

        setProgress(100);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        options?.onError?.(
          err instanceof Error ? err : new Error(errorMessage),
        );
        return null;
      } finally {
        setUploading(false);
      }
    },
    [getToken],
  );

  /**
   * Reset the upload state
   */
  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadFile,
    uploading,
    progress,
    error,
    reset,
  };
}

/**
 * Standalone function to upload a file (without hook)
 * Useful for one-off uploads or outside React components
 *
 * @example
 * ```tsx
 * const result = await uploadFileToAzure(
 *   file,
 *   UploadDirectory.LOGOS,
 *   authToken,
 *   {
 *     onProgress: (p) => console.log(`${p}%`),
 *     onSuccess: (r) => console.log('Uploaded:', r.blobUrl)
 *   }
 * );
 * ```
 */
export async function uploadFileToAzure(
  file: File,
  directory: UploadDirectory,
  authToken: string,
  options?: UploadOptions,
): Promise<UploadResult | null> {
  try {
    if (!authToken) {
      throw new Error("Authentication token is required");
    }

    // Step 1: Request upload URL from backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/media/generate-upload-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          directory,
          fileSize: file.size,
        } as GenerateUploadUrlRequest),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to generate upload URL",
      );
    }

    const { data } = await response.json();
    const uploadData = data as GenerateUploadUrlResponse;

    // Step 2: Upload file to Azure
    await uploadToAzure(file, uploadData.uploadUrl, options?.onProgress);

    // Step 3: Return result
    const result: UploadResult = {
      blobUrl: uploadData.blobUrl,
      blobName: uploadData.blobName,
    };

    options?.onSuccess?.(result);
    return result;
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Upload failed");
    options?.onError?.(error);
    throw error;
  }
}

/**
 * Helper function to validate file before upload
 */
export function validateFile(
  file: File,
  directory: UploadDirectory,
): { valid: boolean; error?: string } {
  const maxSizes: Record<UploadDirectory, number> = {
    [UploadDirectory.LOGOS]: 5 * 1024 * 1024, // 5MB
    [UploadDirectory.TESTIMONIALS]: 100 * 1024 * 1024, // 100MB
    [UploadDirectory.AVATARS]: 2 * 1024 * 1024, // 2MB
    [UploadDirectory.VIDEOS]: 200 * 1024 * 1024, // 200MB
    [UploadDirectory.IMAGES]: 10 * 1024 * 1024, // 10MB
    [UploadDirectory.DOCUMENTS]: 10 * 1024 * 1024, // 10MB
  };

  const allowedTypes: Record<UploadDirectory, string[]> = {
    [UploadDirectory.LOGOS]: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
    ],
    [UploadDirectory.TESTIMONIALS]: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ],
    [UploadDirectory.AVATARS]: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ],
    [UploadDirectory.VIDEOS]: [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ],
    [UploadDirectory.IMAGES]: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    [UploadDirectory.DOCUMENTS]: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  };

  const maxSize = maxSizes[directory];
  const allowed = allowedTypes[directory];

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`,
    };
  }

  // Check file type
  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowed.join(", ")}`,
    };
  }

  return { valid: true };
}
