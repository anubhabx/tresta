import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { CustomFormField } from "@/components/custom-form-field";
import { LogoUploadField } from "@/components/forms/logo-upload-field";
import { ProjectFormData } from "@/lib/schemas/project-schema";

interface BrandingSectionProps {
  control: Control<ProjectFormData>;
  onLogoUpload?: (file: File) => void;
}

export function BrandingSection({ control, onLogoUpload }: BrandingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Customize the look and feel of your testimonial widgets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LogoUploadField control={control} onFileUpload={onLogoUpload} />

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            control={control}
            name="brandColorPrimary"
            type="color"
            label="Primary Brand Color"
            description="Choose your primary brand color for testimonial widgets"
            optional
            placeholder="#FF5733"
          />

          <CustomFormField
            control={control}
            name="brandColorSecondary"
            type="color"
            label="Secondary Brand Color"
            description="Choose your secondary brand color for accents and highlights"
            optional
            placeholder="#33C3FF"
          />
        </div>
      </CardContent>
    </Card>
  );
}
