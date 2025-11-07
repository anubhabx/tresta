import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CustomFormField } from "@/components/custom-form-field";
import { ProjectFormData } from "@/lib/schemas/project-schema";

interface SocialLinksSectionProps {
  control: Control<ProjectFormData>;
}

export function SocialLinksSection({ control }: SocialLinksSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>
          Add links to your social media profiles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            type="url"
            control={control}
            name="twitter"
            label="Twitter"
            placeholder="https://twitter.com/yourhandle"
            optional
          />

          <CustomFormField
            type="url"
            control={control}
            name="linkedin"
            label="LinkedIn"
            placeholder="https://linkedin.com/in/yourprofile"
            optional
          />

          <CustomFormField
            type="url"
            control={control}
            name="github"
            label="GitHub"
            placeholder="https://github.com/yourusername"
            optional
          />

          <CustomFormField
            type="url"
            control={control}
            name="facebook"
            label="Facebook"
            placeholder="https://facebook.com/yourpage"
            optional
          />

          <CustomFormField
            type="url"
            control={control}
            name="instagram"
            label="Instagram"
            placeholder="https://instagram.com/yourhandle"
            optional
          />

          <CustomFormField
            type="url"
            control={control}
            name="youtube"
            label="YouTube"
            placeholder="https://youtube.com/@yourchannel"
            optional
          />
        </div>
      </CardContent>
    </Card>
  );
}
