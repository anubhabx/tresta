import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import { CustomFormField } from "@/components/custom-form-field";
import { ProjectFormData } from "@/lib/schemas/project-schema";

interface URLsSectionProps {
  control: Control<ProjectFormData>;
}

export function URLsSection({ control }: URLsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>URLs & Links</CardTitle>
        <CardDescription>
          Configure important URLs for your project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomFormField
          type="url"
          control={control}
          name="websiteUrl"
          label="Website URL"
          placeholder="https://example.com"
          description="Your project's primary website"
          optional
        />

        <CustomFormField
          type="url"
          control={control}
          name="collectionFormUrl"
          label="Collection Form URL"
          placeholder="https://testimonials.example.com/submit"
          description="Custom URL for testimonial collection (auto-generated if not provided)"
          optional
        />
      </CardContent>
    </Card>
  );
}
