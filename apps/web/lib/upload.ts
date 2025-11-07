/**
 * @deprecated Use useAzureSAS hook from @/hooks/use-azure-sas instead
 * This file is kept for backward compatibility
 */

// Re-export everything from the new implementation
export {
  UploadDirectory,
  useAzureSAS,
  uploadFileToAzure,
  validateFile,
} from "@/hooks/use-azure-sas";

export type { UploadResult } from "@/hooks/use-azure-sas";

// Legacy exports for backward compatibility
export { useAzureSAS as useFileUpload } from "@/hooks/use-azure-sas";
export { uploadFileToAzure as uploadFile } from "@/hooks/use-azure-sas";
