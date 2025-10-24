import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ResponseHandler } from "../lib/response.ts";
import { BadRequestError } from "../lib/errors.ts";
import {
  blobStorageService,
  StorageDirectory
} from "../services/blob-storage.service.ts";

// Validation schema for upload URL request
const generateUploadUrlSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content type is required"),
  directory: z.enum([
    StorageDirectory.LOGOS,
    StorageDirectory.TESTIMONIALS,
    StorageDirectory.AVATARS,
    StorageDirectory.VIDEOS,
    StorageDirectory.IMAGES,
    StorageDirectory.DOCUMENTS
  ] as const, {
    errorMap: () => ({
      message: `Directory must be one of: ${Object.values(StorageDirectory).join(", ")}`
    })
  }),
  fileSize: z.number().positive().optional()
});

/**
 * Generate a pre-signed upload URL for direct client-side uploads
 * POST /api/media/generate-upload-url
 */
const generateUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const validationResult = generateUploadUrlSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new BadRequestError(
        validationResult.error.errors[0]?.message || "Invalid request data"
      );
    }

    const { filename, contentType, directory, fileSize } = validationResult.data;

    // Get user ID from authenticated user
    const userId = req.user?.id;

    // Generate upload URL with SAS token
    const uploadData = await blobStorageService.generateUploadUrl({
      directory,
      filename,
      contentType,
      fileSize,
      expiresInMinutes: 10, // URL valid for 10 minutes
      userId
    });

    return ResponseHandler.success(res, {
      data: uploadData,
      message: "Upload URL generated successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a pre-signed read URL for accessing private files
 * POST /api/media/generate-read-url
 */
const generateReadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blobName } = req.body;

    if (!blobName || typeof blobName !== "string") {
      throw new BadRequestError("Blob name is required");
    }

    // Generate read URL with SAS token
    const readUrl = await blobStorageService.generateReadUrl(
      blobName,
      60 // URL valid for 60 minutes
    );

    return ResponseHandler.success(res, {
      data: { url: readUrl },
      message: "Read URL generated successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a blob
 * DELETE /api/media/:blobName
 */
const deleteBlob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blobName } = req.params;

    if (!blobName) {
      throw new BadRequestError("Blob name is required");
    }

    // TODO: Add authorization check - verify user owns this blob

    await blobStorageService.deleteBlob(decodeURIComponent(blobName));

    return ResponseHandler.deleted(res, "File deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get blob metadata
 * GET /api/media/:blobName/metadata
 */
const getBlobMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blobName } = req.params;

    if (!blobName) {
      throw new BadRequestError("Blob name is required");
    }

    const metadata = await blobStorageService.getBlobMetadata(
      decodeURIComponent(blobName)
    );

    return ResponseHandler.success(res, {
      data: metadata,
      message: "Metadata retrieved successfully"
    });
  } catch (error) {
    next(error);
  }
};

export { generateUploadUrl, generateReadUrl, deleteBlob, getBlobMetadata };