"use client";

import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CustomFormField } from "@/components/custom-form-field";
import { ModerationSettingsFormData } from "@/lib/schemas/moderation-settings-schema";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface AdvancedModerationSettingsProps {
  control: Control<ModerationSettingsFormData>;
  watch: (name: keyof ModerationSettingsFormData) => any;
}

export function AdvancedModerationSettings({
  control,
  watch,
}: AdvancedModerationSettingsProps) {
  const autoModerationEnabled = watch("autoModeration");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
        <CardDescription>
          Fine-tune content validation and spam detection rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Length Validation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Content Validation</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Set minimum requirements for testimonial content quality
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <CustomFormField
            type="number"
            control={control}
            name="minContentLength"
            label="Minimum Content Length"
            placeholder="10"
            description="Minimum characters required (default: 10)"
            disabled={!autoModerationEnabled}
            optional
          />
        </div>

        {/* URL Detection */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">URL Detection</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Control how many URLs are allowed to prevent spam
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <CustomFormField
            type="number"
            control={control}
            name="maxUrlCount"
            label="Maximum URLs Allowed"
            placeholder="2"
            description="Maximum URLs per testimonial (default: 2)"
            disabled={!autoModerationEnabled}
            optional
          />
        </div>

        {/* Domain Management */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Domain Management</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Whitelist or blacklist specific domains for URLs and email
                    addresses
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <CustomFormField
            type="textarea"
            control={control}
            name="allowedDomainsInput"
            label="Allowed Domains"
            placeholder="example.com, yourcompany.com"
            description="Comma-separated list of whitelisted domains for URLs"
            disabled={!autoModerationEnabled}
            optional
          />

          <CustomFormField
            type="textarea"
            control={control}
            name="blockedDomainsInput"
            label="Blocked Domains"
            placeholder="spam.com, competitor.com"
            description="Comma-separated list of blacklisted email/URL domains"
            disabled={!autoModerationEnabled}
            optional
          />
        </div>

        {/* Custom Keywords */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Custom Keywords</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Add custom words to block or track brand mentions
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <CustomFormField
            type="textarea"
            control={control}
            name="customProfanityInput"
            label="Custom Profanity List"
            placeholder="badword1, badword2"
            description="Comma-separated list of additional words to block"
            disabled={!autoModerationEnabled}
            optional
          />

          <CustomFormField
            type="textarea"
            control={control}
            name="brandKeywordsInput"
            label="Brand Keywords"
            placeholder="YourBrand, ProductName"
            description="Track brand mentions to detect excessive promotional language"
            disabled={!autoModerationEnabled}
            optional
          />
        </div>
      </CardContent>
    </Card>
  );
}
