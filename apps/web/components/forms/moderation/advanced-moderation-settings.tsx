"use client";

import { Control } from "react-hook-form";
import { CustomFormField } from "@/components/custom-form-field";
import { ModerationSettingsFormData } from "@/lib/schemas/moderation-settings-schema";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";

interface AdvancedModerationSettingsProps {
  control: Control<ModerationSettingsFormData>;
  watch: (name: keyof ModerationSettingsFormData) => any;
}

export function AdvancedModerationSettings({ control, watch }: AdvancedModerationSettingsProps) {
  const autoModerationEnabled = watch("autoModeration");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold">Advanced Settings</h3>
          <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger><TooltipContent className="max-w-xs"><p>Fine-tune content validation and spam detection rules</p></TooltipContent></Tooltip></TooltipProvider>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Content Validation</h4>
            <CustomFormField type="number" control={control} name="minContentLength" label="Minimum Content Length" placeholder="10" description="Minimum characters required (default: 10)" disabled={!autoModerationEnabled} optional />
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">URL Detection</h4>
            <CustomFormField type="number" control={control} name="maxUrlCount" label="Maximum URLs Allowed" placeholder="2" description="Maximum URLs per testimonial (default: 2)" disabled={!autoModerationEnabled} optional />
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Domain Management</h4>
            <div className="space-y-4">
              <CustomFormField type="textarea" control={control} name="allowedDomainsInput" label="Allowed Domains" placeholder="example.com, yourcompany.com" description="Comma-separated list of whitelisted domains for URLs" disabled={!autoModerationEnabled} optional />
              <CustomFormField type="textarea" control={control} name="blockedDomainsInput" label="Blocked Domains" placeholder="spam.com, competitor.com" description="Comma-separated list of blacklisted email/URL domains" disabled={!autoModerationEnabled} optional />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Custom Keywords</h4>
            <div className="space-y-4">
              <CustomFormField type="textarea" control={control} name="customProfanityInput" label="Custom Profanity List" placeholder="badword1, badword2" description="Comma-separated list of additional words to block" disabled={!autoModerationEnabled} optional />
              <CustomFormField type="textarea" control={control} name="brandKeywordsInput" label="Brand Keywords" placeholder="YourBrand, ProductName" description="Track brand mentions to detect excessive promotional language" disabled={!autoModerationEnabled} optional />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
