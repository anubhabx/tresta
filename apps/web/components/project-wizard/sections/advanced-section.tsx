/**
 * Advanced Section (Accordion)
 *
 * URLs, social links, tags, and other advanced settings.
 */

"use client";

import * as React from "react";
import { Control, UseFormRegister } from "react-hook-form";
import { ChevronDown, Globe, Share2, Tags, Settings2 } from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

import { CustomFormField } from "@/components/custom-form-field";
import { ProjectFormData } from "@/lib/schemas/project-schema";
import { LockedToggle, ProBadge } from "@/components/paywall";

// ============================================================================
// TYPES
// ============================================================================

interface AdvancedSectionProps {
  control: Control<ProjectFormData>;
  register: UseFormRegister<ProjectFormData>;
  isPro?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdvancedSection({
  control,
  register,
  isPro = false,
}: AdvancedSectionProps) {
  return (
    <Card className="overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        {/* URLs Section */}
        <AccordionItem value="urls" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <span className="font-medium">Website & URLs</span>
                <p className="text-xs text-muted-foreground font-normal">
                  Link to your site and collection form
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4 pt-2">
              <CustomFormField
                type="text"
                control={control}
                name="websiteUrl"
                label="Website URL"
                placeholder="https://yoursite.com"
                optional
              />
              <CustomFormField
                type="text"
                control={control}
                name="collectionFormUrl"
                label="Collection Form URL"
                placeholder="https://yoursite.com/testimonials"
                description="Where visitors submit new testimonials"
                optional
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Social Links Section */}
        <AccordionItem value="social" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <span className="font-medium">Social Links</span>
                <p className="text-xs text-muted-foreground font-normal">
                  Connect your social profiles
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <CustomFormField
                type="text"
                control={control}
                name="twitter"
                label="Twitter / X"
                placeholder="https://twitter.com/yourhandle"
                optional
              />
              <CustomFormField
                type="text"
                control={control}
                name="linkedin"
                label="LinkedIn"
                placeholder="https://linkedin.com/company/..."
                optional
              />
              <CustomFormField
                type="text"
                control={control}
                name="github"
                label="GitHub"
                placeholder="https://github.com/..."
                optional
              />
              <CustomFormField
                type="text"
                control={control}
                name="instagram"
                label="Instagram"
                placeholder="https://instagram.com/..."
                optional
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tags Section */}
        <AccordionItem value="tags" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Tags className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <span className="font-medium">Tags & Categories</span>
                <p className="text-xs text-muted-foreground font-normal">
                  Organize with custom tags
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-2 pt-2">
              <Label>Tags</Label>
              <Input
                {...register("tagsInput")}
                placeholder="saas, b2b, productivity (comma separated)"
              />
              <p className="text-xs text-muted-foreground">
                Add tags to categorize and filter your projects
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Settings Section */}
        <AccordionItem value="advanced" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Settings2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Pro Settings</span>
                  {!isPro && <ProBadge size="sm" />}
                </div>
                <p className="text-xs text-muted-foreground font-normal">
                  Custom domain and advanced controls
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4 pt-2">
              {/* Custom Domain */}
              <LockedToggle
                isPro={isPro}
                featureName="custom_domain"
                checked={false}
                onCheckedChange={() => {
                  toast.info("Coming soon! Custom domains are not yet available.");
                }}
                label="Custom Domain"
                description="Use yourdomain.com for your testimonial pages"
              />

              {/* Detailed Description */}
              <div className="space-y-2">
                <Label>Detailed Description</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Provide a detailed description of your project..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Shown on your public project page.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
