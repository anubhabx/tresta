import { Router } from "express";
import {
  generateUploadUrl,
  generateReadUrl,
  deleteBlob,
  getBlobMetadata,
} from '../controllers/media.controller.js';

const router: Router = Router();

// Generate pre-signed upload URL
router.post("/generate-upload-url", generateUploadUrl);

// Generate pre-signed read URL (for private files)
router.post("/generate-read-url", generateReadUrl);

// Get blob metadata
router.get("/:blobName/metadata", getBlobMetadata);

// Delete blob
router.delete("/:blobName", deleteBlob);

export { router as mediaRouter };
