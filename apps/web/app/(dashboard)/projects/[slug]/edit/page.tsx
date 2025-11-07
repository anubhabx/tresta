"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import { Separator } from "@workspace/ui/components/separator";
import { LoadingStars } from "@/components/loader";
import { useProjectEditForm } from "@/hooks/use-project-edit-form";
import {
  BasicInfoSection,
  URLsSection,
  BrandingSection,
  SocialLinksSection,
  TagsSection,
} from "@/components/forms/project";

interface ProjectEditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const ProjectEditPage = ({ params }: ProjectEditPageProps) => {
  const { slug } = use(params);
  const {
    form,
    control,
    setValue,
    getValues,
    watch,
    register,
    formState,
    isSubmitting,
    isLoadingProject,
    project,
    handleLogoUpload,
    onSubmit,
  } = useProjectEditForm(slug);

  if (isLoadingProject) {
    return (
      <div className="flex flex-col gap-4 w-full h-full items-center justify-center">
        <LoadingStars />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col gap-4 w-full h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Link href="/projects">
            <Button className="mt-4">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Link>
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground mt-2">
          Update your project settings and configuration
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="space-y-8"
          onKeyDown={(e) => {
            // Prevent form submission on Enter key
            if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
        >
          <BasicInfoSection
            control={control}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
            enableSlugAutoGeneration={false}
          />

          <URLsSection control={control} />

          <BrandingSection control={control} onLogoUpload={handleLogoUpload} />

          <SocialLinksSection control={control} />

          <TagsSection register={register} />

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href={`/projects/${slug}`}>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProjectEditPage;
