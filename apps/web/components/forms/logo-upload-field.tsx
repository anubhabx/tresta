import { useState } from "react";
import { Control } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { CustomFormField } from "@/components/custom-form-field";
import { ProjectFormData } from "@/lib/schemas/project-schema";

interface LogoUploadFieldProps {
  control: Control<ProjectFormData>;
  onFileUpload?: (file: File) => void;
}

export function LogoUploadField({
  control,
  onFileUpload,
}: LogoUploadFieldProps) {
  const [useLogoUrl, setUseLogoUrl] = useState(true);

  const handleLogoUpload = (files: File[]) => {
    if (files.length > 0 && files[0]) {
      onFileUpload?.(files[0]);
      toast.info(
        "Logo uploaded. Note: File upload to storage not yet implemented.",
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Logo</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={useLogoUrl ? "default" : "outline"}
            size="sm"
            onClick={() => setUseLogoUrl(true)}
          >
            URL
          </Button>
          <Button
            type="button"
            variant={!useLogoUrl ? "default" : "outline"}
            size="sm"
            onClick={() => setUseLogoUrl(false)}
          >
            Upload
          </Button>
        </div>
      </div>

      {useLogoUrl ? (
        <CustomFormField
          type="url"
          control={control}
          name="logoUrl"
          label=""
          placeholder="https://example.com/logo.png"
          description="Provide a URL to your logo image"
          optional
        />
      ) : (
        <CustomFormField
          type="file"
          control={control}
          name="logoUrl"
          label=""
          description="Upload your logo image (drag & drop or click to browse)"
          optional
          onChange={handleLogoUpload}
        />
      )}
    </div>
  );
}
