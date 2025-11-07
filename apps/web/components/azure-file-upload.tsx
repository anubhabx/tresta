"use client";

import { useState } from "react";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { toast } from "sonner";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import {
  useAzureSAS,
  UploadDirectory,
  validateFile,
} from "@/hooks/use-azure-sas";

interface AzureFileUploadProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  directory: UploadDirectory;
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
  className?: string;
  onUploadComplete?: (blobUrl: string) => void;
}

/**
 * Azure File Upload Component
 * Handles file uploads to Azure Blob Storage with SAS URLs
 *
 * @example
 * ```tsx
 * <AzureFileUpload
 *   control={form.control}
 *   name="logoUrl"
 *   directory={UploadDirectory.LOGOS}
 *   label="Project Logo"
 *   accept="image/*"
 *   preview
 * />
 * ```
 */
export function AzureFileUpload<TFieldValues extends FieldValues>({
  control,
  name,
  directory,
  label = "Upload File",
  description,
  accept,
  maxSizeMB,
  preview = false,
  className,
  onUploadComplete,
}: AzureFileUploadProps<TFieldValues>) {
  const { uploadFile, uploading, progress, error, reset } = useAzureSAS();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (
    file: File,
    onChange: (value: string) => void,
  ) => {
    reset();

    // Validate file
    const validation = validateFile(file, directory);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    try {
      // Create preview for images
      if (preview && file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }

      setFileName(file.name);

      // Upload to Azure
      const result = await uploadFile(file, directory, {
        onProgress: (p) => {
          // Progress is automatically tracked by the hook
        },
        onSuccess: (r) => {
          toast.success("File uploaded successfully!");
          onUploadComplete?.(r.blobUrl);
        },
        onError: (err) => {
          toast.error(err.message);
        },
      });

      if (result) {
        // Update form field with blob URL
        onChange(result.blobUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setPreviewUrl(null);
      setFileName(null);
    }
  };

  const handleRemove = (onChange: (value: string) => void) => {
    onChange("");
    setPreviewUrl(null);
    setFileName(null);
    reset();
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const currentUrl = field.value as string;
        const displayUrl = previewUrl || currentUrl;
        const isImage =
          displayUrl &&
          (displayUrl.includes(".png") ||
            displayUrl.includes(".jpg") ||
            displayUrl.includes(".jpeg") ||
            displayUrl.includes(".webp") ||
            displayUrl.includes(".svg"));

        return (
          <FormItem className={className}>
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
            <FormControl>
              <div className="space-y-4">
                {/* Upload Area */}
                {!displayUrl && !uploading && (
                  <label
                    htmlFor={`file-upload-${name}`}
                    className={cn(
                      "flex flex-col items-center justify-center",
                      "w-full h-32 border-2 border-dashed rounded-lg",
                      "cursor-pointer transition-colors",
                      "border-muted-foreground/25 hover:border-muted-foreground/50",
                      "hover:bg-muted/10",
                    )}
                  >
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload</p>
                      {maxSizeMB && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Max size: {maxSizeMB}MB
                        </p>
                      )}
                    </div>
                    <input
                      id={`file-upload-${name}`}
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(file, field.onChange);
                        }
                      }}
                    />
                  </label>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium">
                          Uploading {fileName}...
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                {/* Preview/Display */}
                {displayUrl && !uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      {preview && isImage ? (
                        <img
                          src={displayUrl}
                          alt="Upload preview"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileName || "File uploaded"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {displayUrl}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(field.onChange)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
