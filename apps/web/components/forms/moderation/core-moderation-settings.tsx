"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Switch } from "@workspace/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ModerationSettingsFormData } from "@/lib/schemas/moderation-settings-schema";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface CoreModerationSettingsProps {
  control: Control<ModerationSettingsFormData>;
  watch: (name: keyof ModerationSettingsFormData) => any;
}

export function CoreModerationSettings({
  control,
  watch,
}: CoreModerationSettingsProps) {
  const autoModerationEnabled = watch("autoModeration");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-4">Core Settings</h3>
        <div className="space-y-6">
          <FormField
            control={control}
            name="autoModeration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Auto-Moderation
                  </FormLabel>
                  <FormDescription>
                    Automatically scan and flag testimonials for spam,
                    profanity, and inappropriate content
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="autoApproveVerified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <FormLabel className="text-base">
                      Auto-Approve Verified Users
                    </FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Automatically approve testimonials from users who
                            verified via OAuth (Google, etc.) if they pass
                            quality checks
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormDescription>
                    Skip manual review for OAuth-verified submissions with high
                    quality scores
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!autoModerationEnabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="profanityFilterLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profanity Filter Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!autoModerationEnabled}
                >
                  <FormControl>
                    <SelectTrigger className="h-fit! w-full">
                      <SelectValue placeholder="Select filter level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LENIENT">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Lenient</span>
                        <span className="text-xs text-muted-foreground">
                          Only blocks severe profanity and custom words
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MODERATE">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          Moderate (Recommended)
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Blocks severe profanity, flags mild profanity
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="STRICT">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Strict</span>
                        <span className="text-xs text-muted-foreground">
                          Blocks all profanity including mild terms
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Adjust how aggressively the system filters profane language
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
