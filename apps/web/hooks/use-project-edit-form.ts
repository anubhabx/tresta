import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { projects } from "@/lib/queries";
import {
  projectFormSchema,
  ProjectFormData,
} from "@/lib/schemas/project-schema";
import { ProjectType, ProjectVisibility, type SocialLinks } from "@/types/api";
import { useApi } from "@/hooks/use-api";

export function useProjectEditForm(slug: string) {
  const router = useRouter();
  const api = useApi();
  const updateProject = projects.mutations.useUpdate(slug);
  const { data: projectData, isLoading: isLoadingProject } =
    projects.queries.useDetail(slug);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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
      tagsInput: "",
    },
  });

  const {
    reset,
    control,
    setValue,
    getValues,
    watch,
    register,
    handleSubmit,
    formState,
  } = form;

  // Populate form when project data loads
  useEffect(() => {
    if (projectData) {
      const project = projectData;

      // Convert tags array to comma-separated string
      const tagsString = project.tags?.join(", ") || "";

      // Extract social links
      const socialLinks = project.socialLinks || {};

      reset({
        name: project.name,
        shortDescription: project.shortDescription || "",
        description: project.description || "",
        slug: project.slug,
        logoUrl: project.logoUrl || "",
        projectType: project.projectType || ProjectType.OTHER,
        websiteUrl: project.websiteUrl || "",
        collectionFormUrl: project.collectionFormUrl || "",
        brandColorPrimary: project.brandColorPrimary || "",
        brandColorSecondary: project.brandColorSecondary || "",
        visibility: project.visibility || ProjectVisibility.PRIVATE,
        twitter: socialLinks.twitter || "",
        linkedin: socialLinks.linkedin || "",
        github: socialLinks.github || "",
        facebook: socialLinks.facebook || "",
        instagram: socialLinks.instagram || "",
        youtube: socialLinks.youtube || "",
        tagsInput: tagsString,
      });
    }
  }, [projectData, reset]);

  const handleLogoUpload = async (file: File) => {
    setUploadedLogo(file);
    setIsUploadingLogo(true);

    try {
      // Generate upload URL from backend
      const uploadResponse = await api.post<{
        success: boolean;
        data: {
          uploadUrl: string;
          blobUrl: string;
          blobName: string;
        };
      }>("/api/media/generate-upload-url", {
        filename: file.name,
        contentType: file.type,
        directory: "logos",
        fileSize: file.size,
      });

      if (!uploadResponse.data.success) {
        throw new Error("Failed to generate upload URL");
      }

      const { uploadUrl, blobUrl } = uploadResponse.data.data;

      // Upload file directly to Azure Blob Storage
      const uploadResult = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload file");
      }

      // Set the permanent blob URL
      setValue("logoUrl", blobUrl);
      toast.success("Logo uploaded successfully!");
    } catch (error: any) {
      console.error("Logo upload failed:", error);
      toast.error(error?.message || "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
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

      // Create update payload
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
        visibility: data.visibility,
      };

      await updateProject.mutateAsync(payload);

      toast.success("Project updated successfully!");
      router.push(`/projects/${data.slug}`);
    } catch (error: any) {
      // console.error("Failed to update project:", error);
      toast.error(
        error.message || "Failed to update project. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    control,
    setValue,
    getValues,
    watch,
    register,
    handleSubmit,
    formState,
    isSubmitting,
    isUploadingLogo,
    isLoadingProject,
    project: projectData,
    handleLogoUpload,
    onSubmit: form.handleSubmit(onSubmit, (errors) => {
      console.log("Form validation errors:", errors);
      const errorMessages = Object.values(errors)
        .map((err: any) => err.message)
        .join(", ");
      toast.error(`Please check the form: ${errorMessages}`);
    }),
  };
}
