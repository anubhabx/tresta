import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  ContainerClient
} from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { InternalServerError } from "../lib/errors.ts";

// Environment variables
const getStorageConfig = () => {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "media";

  return { accountName, accountKey, containerName };
};

// Storage directories for different file types
export const StorageDirectory = {
  LOGOS: "logos",
  TESTIMONIALS: "testimonials",
  AVATARS: "avatars",
  VIDEOS: "videos",
  IMAGES: "images",
  DOCUMENTS: "documents"
} as const;

export type StorageDirectory = typeof StorageDirectory[keyof typeof StorageDirectory];

// Allowed file types per directory
const ALLOWED_FILE_TYPES: Record<StorageDirectory, string[]> = {
  [StorageDirectory.LOGOS]: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/webp"
  ],
  [StorageDirectory.TESTIMONIALS]: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime"
  ],
  [StorageDirectory.AVATARS]: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp"
  ],
  [StorageDirectory.VIDEOS]: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo"
  ],
  [StorageDirectory.IMAGES]: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ],
  [StorageDirectory.DOCUMENTS]: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]
};

// Max file sizes per directory (in bytes)
const MAX_FILE_SIZES: Record<StorageDirectory, number> = {
  [StorageDirectory.LOGOS]: 5 * 1024 * 1024, // 5MB
  [StorageDirectory.TESTIMONIALS]: 100 * 1024 * 1024, // 100MB (for videos)
  [StorageDirectory.AVATARS]: 2 * 1024 * 1024, // 2MB
  [StorageDirectory.VIDEOS]: 200 * 1024 * 1024, // 200MB
  [StorageDirectory.IMAGES]: 10 * 1024 * 1024, // 10MB
  [StorageDirectory.DOCUMENTS]: 10 * 1024 * 1024 // 10MB
};

// Initialize Azure Blob Storage client (lazy initialization)
let _credentials: StorageSharedKeyCredential | null = null;
let _blobServiceClient: BlobServiceClient | null = null;
let _containerClient: ContainerClient | null = null;

const getCredentials = (): StorageSharedKeyCredential => {
  if (!_credentials) {
    const { accountName, accountKey } = getStorageConfig();
    
    if (!accountName || !accountKey) {
      throw new InternalServerError(
        "Azure Storage credentials are not configured. Please set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY environment variables."
      );
    }

    _credentials = new StorageSharedKeyCredential(accountName, accountKey);
  }
  return _credentials;
};

const getBlobServiceClient = (): BlobServiceClient => {
  if (!_blobServiceClient) {
    const { accountName } = getStorageConfig();
    const credentials = getCredentials();
    
    _blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credentials
    );
  }
  return _blobServiceClient;
};

const getContainerClient = (): ContainerClient => {
  if (!_containerClient) {
    const { containerName } = getStorageConfig();
    const blobServiceClient = getBlobServiceClient();
    _containerClient = blobServiceClient.getContainerClient(containerName);
  }
  return _containerClient;
};

/**
 * Interface for upload URL generation options
 */
export interface GenerateUploadUrlOptions {
  directory: StorageDirectory;
  filename: string;
  contentType: string;
  fileSize?: number;
  expiresInMinutes?: number;
  userId?: string; // Optional: for user-specific organization
}

/**
 * Interface for the generated upload URL response
 */
export interface UploadUrlResponse {
  uploadUrl: string;
  blobUrl: string;
  blobName: string;
  expiresAt: Date;
}

class BlobStorageService {
  /**
   * Ensure the container exists (create if it doesn't)
   */
  async ensureContainerExists(): Promise<void> {
    try {
      const containerClient = getContainerClient();
      const { containerName } = getStorageConfig();
      
      const exists = await containerClient.exists();
      if (!exists) {
        // Create private container - access controlled via SAS URLs
        await containerClient.create();
        // console.log(`Container "${containerName}" created successfully (private access)`);
      }
    } catch (error) {
      console.error("Error ensuring container exists:", error);
      throw new InternalServerError("Failed to initialize storage container");
    }
  }

  /**
   * Configure CORS settings for the storage account
   * This allows browser uploads directly to Azure Blob Storage
   */
  async configureCORS(): Promise<void> {
    try {
      const blobServiceClient = getBlobServiceClient();
      
      // Configure CORS rules
      const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
        ? process.env.CORS_ALLOWED_ORIGINS
        : 'http://localhost:3000,http://localhost:3001';
      
      const corsRules = [
        {
          allowedOrigins,
          allowedMethods: 'GET,PUT,POST,DELETE,HEAD,OPTIONS',
          allowedHeaders: '*',
          exposedHeaders: '*',
          maxAgeInSeconds: 3600
        }
      ];
      
      // Set the CORS properties
      await blobServiceClient.setProperties({
        cors: corsRules
      });
      
    //   console.log('CORS configured successfully for Azure Blob Storage');
    //   console.log('Allowed origins:', allowedOrigins);
    } catch (error) {
      console.error('Error configuring CORS:', error);
      // Don't throw - CORS configuration failure shouldn't stop the app
      console.warn('Failed to configure CORS. You may need to configure it manually in Azure Portal.');
    }
  }

  /**
   * Validate file type for a given directory
   */
  private validateFileType(
    directory: StorageDirectory,
    contentType: string
  ): void {
    const allowedTypes = ALLOWED_FILE_TYPES[directory];
    if (!allowedTypes.includes(contentType)) {
      throw new Error(
        `File type "${contentType}" is not allowed in "${directory}" directory. Allowed types: ${allowedTypes.join(", ")}`
      );
    }
  }

  /**
   * Validate file size for a given directory
   */
  private validateFileSize(
    directory: StorageDirectory,
    fileSize?: number
  ): void {
    if (!fileSize) return;

    const maxSize = MAX_FILE_SIZES[directory];
    if (fileSize > maxSize) {
      throw new Error(
        `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB for "${directory}" directory`
      );
    }
  }

  /**
   * Generate a unique blob name with directory prefix
   */
  private generateBlobName(
    directory: StorageDirectory,
    filename: string,
    userId?: string
  ): string {
    // Sanitize filename - remove special characters
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Extract file extension
    const extension = sanitizedFilename.split(".").pop() || "";
    const nameWithoutExt = sanitizedFilename.replace(`.${extension}`, "");

    // Generate unique filename
    const uniqueId = uuidv4();
    const timestamp = Date.now();

    // Build blob path: directory/userId?/timestamp-uuid-filename.ext
    const parts: string[] = [directory];
    if (userId) {
      parts.push(userId);
    }
    parts.push(`${timestamp}-${uniqueId}-${nameWithoutExt}.${extension}`);

    return parts.join("/");
  }

  /**
   * Generate a SAS URL for uploading a file
   */
  async generateUploadUrl(
    options: GenerateUploadUrlOptions
  ): Promise<UploadUrlResponse> {
    try {
      const {
        directory,
        filename,
        contentType,
        fileSize,
        expiresInMinutes = 10,
        userId
      } = options;

      const { accountName, containerName } = getStorageConfig();
      const credentials = getCredentials();

      // Validate file type and size
      this.validateFileType(directory, contentType);
      this.validateFileSize(directory, fileSize);

      // Generate unique blob name
      const blobName = this.generateBlobName(directory, filename, userId);

      // Set expiry time
      const expiresOn = new Date(
        new Date().valueOf() + expiresInMinutes * 60 * 1000
      );

      // Generate SAS token with create and write permissions
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName,
          blobName,
          permissions: BlobSASPermissions.parse("cw"), // Create and Write
          startsOn: new Date(),
          expiresOn,
          contentType // Set content type in SAS
        },
        credentials
      ).toString();

      // Construct URLs
      const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
      const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

      return {
        uploadUrl,
        blobUrl,
        blobName,
        expiresAt: expiresOn
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerError("Failed to generate upload URL");
    }
  }

  /**
   * Generate a SAS URL for reading a blob (for private files)
   */
  async generateReadUrl(
    blobName: string,
    expiresInMinutes: number = 60
  ): Promise<string> {
    try {
      const { accountName, containerName } = getStorageConfig();
      const credentials = getCredentials();
      
      const expiresOn = new Date(
        new Date().valueOf() + expiresInMinutes * 60 * 1000
      );

      const sasToken = generateBlobSASQueryParameters(
        {
          containerName,
          blobName,
          permissions: BlobSASPermissions.parse("r"), // Read only
          startsOn: new Date(),
          expiresOn
        },
        credentials
      ).toString();

      return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    } catch (error) {
      throw new InternalServerError("Failed to generate read URL");
    }
  }

  /**
   * Delete a blob
   */
  async deleteBlob(blobName: string): Promise<void> {
    try {
      const containerClient = getContainerClient();
      const blobClient = containerClient.getBlobClient(blobName);
      await blobClient.deleteIfExists();
    } catch (error) {
      throw new InternalServerError("Failed to delete blob");
    }
  }

  /**
   * Check if a blob exists
   */
  async blobExists(blobName: string): Promise<boolean> {
    try {
      const containerClient = getContainerClient();
      const blobClient = containerClient.getBlobClient(blobName);
      return await blobClient.exists();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get blob metadata
   */
  async getBlobMetadata(blobName: string) {
    try {
      const containerClient = getContainerClient();
      const blobClient = containerClient.getBlobClient(blobName);
      const properties = await blobClient.getProperties();
      return {
        contentType: properties.contentType,
        contentLength: properties.contentLength,
        lastModified: properties.lastModified,
        metadata: properties.metadata
      };
    } catch (error) {
      throw new InternalServerError("Failed to get blob metadata");
    }
  }

  /**
   * Upload an image from a URL to Azure Blob Storage
   * Useful for syncing avatars from third-party services (e.g., Clerk)
   */
  async uploadFromUrl(
    imageUrl: string,
    directory: StorageDirectory,
    userId?: string
  ): Promise<string> {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
      }

      // Get the content type and buffer
      const contentType = response.headers.get("content-type") || "image/jpeg";
      const buffer = Buffer.from(await response.arrayBuffer());

      // Validate file type
      this.validateFileType(directory, contentType);
      this.validateFileSize(directory, buffer.length);

      // Generate filename from URL or use a default
      const urlParts = new URL(imageUrl).pathname.split("/");
      const originalFilename = urlParts[urlParts.length - 1] || "avatar.jpg";
      
      // Generate unique blob name
      const blobName = this.generateBlobName(directory, originalFilename, userId);

      // Upload to Azure Blob Storage
      const containerClient = getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });

      // Return the public blob URL (without SAS token for public read)
      const { accountName, containerName } = getStorageConfig();
      return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
    } catch (error) {
      console.error("Error uploading from URL:", error);
      throw new InternalServerError("Failed to upload image from URL");
    }
  }
}

// Export singleton instance
export const blobStorageService = new BlobStorageService();
