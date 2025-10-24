import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { projects } from "@/lib/queries";
import { projectFormSchema, ProjectFormData } from "@/lib/schemas/project-schema";
import { ProjectType, ProjectVisibility, type SocialLinks } from "@/types/api";

export function useProjectForm() {
  const router = useRouter();
  const createProject = projects.mutations.useCreate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      slug: "",
      logoUrl: "",
      projectType: ProjectType.OTHER,
      websiteUrl: "",
      collectionFormUrl: "",
      brandColorPrimary: "",
      brandColorSecondary: "",
      visibility: ProjectVisibility.PRIVATE,
      twitter: "",
      linkedin: "",
      github: "",
      facebook: "",
      instagram: "",
      youtube: "",
      tagsInput: ""
    }
  });

  const handleLogoUpload = (file: File) => {
    setUploadedLogo(file);
    // TODO: Upload file to storage service and get URL
    // For now, create a temporary object URL
    const objectUrl = URL.createObjectURL(file);
    form.setValue("logoUrl", objectUrl);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);

      // Build social links object
      const socialLinks: SocialLinks = {};
      if (data.twitter) socialLinks.twitter = data.twitter;
      if (data.linkedin) socialLinks.linkedin = data.linkedin;
      if (data.github) socialLinks.github = data.github;
      if (data.facebook) socialLinks.facebook = data.facebook;
      if (data.instagram) socialLinks.instagram = data.instagram;
      if (data.youtube) socialLinks.youtube = data.youtube;

      // Parse tags from comma-separated string
      const tags = data.tagsInput
        ? data.tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [];

      // Create project payload
      const payload = {
        name: data.name,
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        slug: data.slug,
        logoUrl: data.logoUrl || undefined,
        projectType: data.projectType,
        websiteUrl: data.websiteUrl || undefined,
        collectionFormUrl: data.collectionFormUrl || undefined,
        brandColorPrimary: data.brandColorPrimary || undefined,
        brandColorSecondary: data.brandColorSecondary || undefined,
        socialLinks:
          Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        tags: tags.length > 0 ? tags : undefined,
        visibility: data.visibility
      };

      await createProject.mutateAsync(payload);

      toast.success("Project created successfully!");
      router.push(`/projects/${data.slug}`);
    } catch (error: any) {
      // console.error("Failed to create project:", error);
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    uploadedLogo,
    handleLogoUpload,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
