import { Control } from "react-hook-form";
import { Badge } from "@workspace/ui/components/badge";
import { Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { CustomFormField } from "@/components/custom-form-field";
import { AzureFileUpload } from "@/components/azure-file-upload";
import { UploadDirectory } from "@/hooks/use-azure-sas";
import { ProjectFormData } from "@/lib/schemas/project-schema";

interface BrandingSectionProps {
  control: Control<ProjectFormData>;
  onLogoUpload?: (file: File) => void;
  isPro?: boolean;
}

import { toast } from "sonner";
import { useUpgradeModal } from "@/components/billing/upgrade-modal";

export function BrandingSection({
  control,
  onLogoUpload,
  isPro = false,
}: BrandingSectionProps) {
  const { open } = useUpgradeModal();

  const handleProFeatureClick = () => {
    if (!isPro) {
      toast.info("This is a Pro feature", {
        description: "Upgrade to the Pro plan to customize your brand colors.",
        action: {
          label: "Upgrade",
          onClick: () => open(),
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Customize the look and feel of your testimonial widgets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AzureFileUpload
          control={control}
          name="logoUrl"
          directory={UploadDirectory.LOGOS}
          label="Project Logo"
          description="Upload your project logo (PNG, JPG, SVG, or WebP, max 5MB)"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          maxSizeMB={5}
          preview
          // onUploadComplete={(blobUrl) => {
          //   console.log("Logo uploaded to Azure:", blobUrl);
          // }}
        />

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div
              className={`flex items-center justify-between mb-2 ${!isPro ? "cursor-pointer" : ""}`}
              onClick={handleProFeatureClick}
            >
              <div className="flex items-center gap-2">
                {!isPro && <Lock className="w-3 h-3 text-muted-foreground" />}
                {!isPro && (
                  <Badge
                    variant="secondary"
                    className="text-xs h-5 px-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800"
                  >
                    PRO
                  </Badge>
                )}
              </div>
            </div>

            <div className="relative">
              {!isPro && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={handleProFeatureClick}
                />
              )}
              <CustomFormField
                control={control}
                name="brandColorPrimary"
                type="color"
                label="Primary Brand Color"
                description="Choose your primary brand color for testimonial widgets"
                optional
                placeholder="#FF5733"
                disabled={!isPro}
              />
            </div>
          </div>

          <div className="relative">
            <div
              className={`flex items-center justify-between mb-2 ${!isPro ? "cursor-pointer" : ""}`}
              onClick={handleProFeatureClick}
            >
              <div className="flex items-center gap-2">
                {!isPro && <Lock className="w-3 h-3 text-muted-foreground" />}
                {!isPro && (
                  <Badge
                    variant="secondary"
                    className="text-xs h-5 px-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800"
                  >
                    PRO
                  </Badge>
                )}
              </div>
            </div>
            <div className="relative">
              {!isPro && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={handleProFeatureClick}
                />
              )}
              <CustomFormField
                control={control}
                name="brandColorSecondary"
                type="color"
                label="Secondary Brand Color"
                description="Choose your secondary brand color for accents and highlights"
                optional
                placeholder="#33C3FF"
                disabled={!isPro}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
