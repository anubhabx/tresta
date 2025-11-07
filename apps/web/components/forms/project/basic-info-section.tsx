import { useState, useCallback } from "react";
import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CustomFormField } from "@/components/custom-form-field";
import { ProjectTypeSelect } from "@/components/forms/project-type-select";
import { VisibilitySelect } from "@/components/forms/visibility-select";
import { ProjectFormData, generateSlug } from "@/lib/schemas/project-schema";
import { ProjectType, ProjectVisibility } from "@/types/api";
import { UseFormSetValue, UseFormGetValues } from "react-hook-form";

interface BasicInfoSectionProps {
  control: Control<ProjectFormData>;
  setValue: UseFormSetValue<ProjectFormData>;
  getValues: UseFormGetValues<ProjectFormData>;
  watch: (name: keyof ProjectFormData) => any;
  enableSlugAutoGeneration?: boolean;
}

export function BasicInfoSection({
  control,
  setValue,
  getValues,
  watch,
  enableSlugAutoGeneration = true,
}: BasicInfoSectionProps) {
  // Track the last auto-generated slug to know if user has manually edited it
  const [lastAutoSlug, setLastAutoSlug] = useState("");
  const [userEditedSlug, setUserEditedSlug] = useState(false);

  const handleNameChange = useCallback(
    (value: string) => {
      if (!enableSlugAutoGeneration) return;

      const newSlug = generateSlug(value);

      // Only auto-update slug if user hasn't manually edited it
      if (!userEditedSlug) {
        setValue("slug", newSlug);
        setLastAutoSlug(newSlug);
      }
    },
    [userEditedSlug, setValue, enableSlugAutoGeneration],
  );

  const handleSlugChange = useCallback(
    (slug: string) => {
      if (!enableSlugAutoGeneration) return;

      // Mark as manually edited if it differs from the auto-generated slug
      if (slug !== lastAutoSlug) {
        setUserEditedSlug(true);
      }
    },
    [lastAutoSlug, enableSlugAutoGeneration],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Essential details about your project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomFormField
          type="text"
          control={control}
          name="name"
          label="Project Name"
          placeholder="My Awesome Project"
          description="The display name for your project"
          required
          {...(enableSlugAutoGeneration ? { onChange: handleNameChange } : {})}
        />

        <CustomFormField
          type="text"
          control={control}
          name="slug"
          label="Project Slug"
          placeholder="my-awesome-project"
          description={
            enableSlugAutoGeneration
              ? "A unique identifier for your project URL (auto-generated from name)"
              : "URL slug cannot be changed after project creation to maintain link stability"
          }
          required
          disabled={!enableSlugAutoGeneration}
          {...(enableSlugAutoGeneration ? { onChange: handleSlugChange } : {})}
        />

        <CustomFormField
          type="text"
          control={control}
          name="shortDescription"
          label="Short Description"
          placeholder="A brief elevator pitch for your product/service"
          description="Maximum 500 characters"
          optional
        />

        <CustomFormField
          type="textarea"
          control={control}
          name="description"
          label="Detailed Description"
          placeholder="Provide a detailed description of your project..."
          description="Maximum 10,000 characters"
          maxLength={10000}
          showCharacterCount
          optional
        />

        <ProjectTypeSelect
          value={watch("projectType")}
          onValueChange={(value) =>
            setValue("projectType", value as ProjectType)
          }
        />

        <VisibilitySelect
          value={watch("visibility")}
          onValueChange={(value) =>
            setValue("visibility", value as ProjectVisibility)
          }
        />
      </CardContent>
    </Card>
  );
}
