"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import { Form } from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";

import { CustomFormField } from "@/components/custom-form-field";
import { projects } from "@/lib/queries";
import { ProjectType, ProjectVisibility, type SocialLinks } from "@/types/api";

// Form schema with validation
const projectFormSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Project name must be less than 255 characters"),
  shortDescription: z
    .string()
    .max(500, "Short description must be less than 500 characters")
    .optional(),
  description: z
    .string()
    .max(10000, "Description must be less than 10,000 characters")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  projectType: z.nativeEnum(ProjectType).optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  collectionFormUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  brandColorPrimary: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional()
    .or(z.literal("")),
  brandColorSecondary: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional()
    .or(z.literal("")),
  visibility: z.nativeEnum(ProjectVisibility).optional(),
  // Social links as separate fields
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  youtube: z.string().url("Invalid URL").optional().or(z.literal("")),
  // Tags as comma-separated string
  tagsInput: z.string().optional()
});

type FormData = z.infer<typeof projectFormSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = projects.mutations.useCreate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [useLogoUrl, setUseLogoUrl] = useState(true); // Toggle between URL and upload

  const form = useForm<FormData>({
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

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (value: string) => {
    const currentSlug = form.getValues("slug");
    const generatedSlug = generateSlug(value);

    // Only auto-update slug if it hasn't been manually edited
    if (!currentSlug || currentSlug === generateSlug(form.getValues("name"))) {
      form.setValue("slug", generatedSlug);
    }
  };

  const handleLogoUpload = (files: File[]) => {
    if (files.length > 0 && files[0]) {
      setUploadedLogo(files[0]);
      // TODO: Upload file to storage service and get URL
      // For now, create a temporary object URL
      const objectUrl = URL.createObjectURL(files[0]);
      form.setValue("logoUrl", objectUrl);
      toast.info("Logo uploaded. Note: File upload to storage not yet implemented.");
    }
  };

  const onSubmit = async (data: FormData) => {
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
      console.error("Failed to create project:", error);
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Set up your project to start collecting testimonials
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomFormField
                type="text"
                control={form.control}
                name="name"
                label="Project Name"
                placeholder="My Awesome Project"
                description="The display name for your project"
                required
                onChange={handleNameChange}
              />

              <CustomFormField
                type="text"
                control={form.control}
                name="slug"
                label="Project Slug"
                placeholder="my-awesome-project"
                description="A unique identifier for your project URL (auto-generated from name)"
                required
              />

              <CustomFormField
                type="text"
                control={form.control}
                name="shortDescription"
                label="Short Description"
                placeholder="A brief elevator pitch for your product/service"
                description="Maximum 500 characters"
                optional
              />

              <CustomFormField
                type="textarea"
                control={form.control}
                name="description"
                label="Detailed Description"
                placeholder="Provide a detailed description of your project..."
                description="Maximum 10,000 characters"
                maxLength={10000}
                showCharacterCount
                optional
              />

              {/* Project Type Select */}
              <div className="space-y-2">
                <Label htmlFor="projectType">
                  Project Type{" "}
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal ml-2"
                  >
                    Optional
                  </Badge>
                </Label>
                <Select
                  value={form.watch("projectType")}
                  onValueChange={(value) =>
                    form.setValue("projectType", value as ProjectType)
                  }
                >
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProjectType.SAAS_APP}>
                      SaaS App
                    </SelectItem>
                    <SelectItem value={ProjectType.PORTFOLIO}>
                      Portfolio
                    </SelectItem>
                    <SelectItem value={ProjectType.MOBILE_APP}>
                      Mobile App
                    </SelectItem>
                    <SelectItem value={ProjectType.CONSULTING_SERVICE}>
                      Consulting Service
                    </SelectItem>
                    <SelectItem value={ProjectType.E_COMMERCE}>
                      E-Commerce
                    </SelectItem>
                    <SelectItem value={ProjectType.AGENCY}>Agency</SelectItem>
                    <SelectItem value={ProjectType.FREELANCE}>
                      Freelance
                    </SelectItem>
                    <SelectItem value={ProjectType.PRODUCT}>Product</SelectItem>
                    <SelectItem value={ProjectType.COURSE}>Course</SelectItem>
                    <SelectItem value={ProjectType.COMMUNITY}>
                      Community
                    </SelectItem>
                    <SelectItem value={ProjectType.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visibility Select */}
              <div className="space-y-2">
                <Label htmlFor="visibility">
                  Visibility{" "}
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal ml-2"
                  >
                    Optional
                  </Badge>
                </Label>
                <Select
                  value={form.watch("visibility")}
                  onValueChange={(value) =>
                    form.setValue("visibility", value as ProjectVisibility)
                  }
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProjectVisibility.PUBLIC}>
                      Public
                    </SelectItem>
                    <SelectItem value={ProjectVisibility.PRIVATE}>
                      Private
                    </SelectItem>
                    <SelectItem value={ProjectVisibility.INVITE_ONLY}>
                      Invite Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* URLs & Links */}
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
                control={form.control}
                name="websiteUrl"
                label="Website URL"
                placeholder="https://example.com"
                description="Your project's primary website"
                optional
              />

              <CustomFormField
                type="url"
                control={form.control}
                name="collectionFormUrl"
                label="Collection Form URL"
                placeholder="https://testimonials.example.com/submit"
                description="Custom URL for testimonial collection (auto-generated if not provided)"
                optional
              />
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize the look and feel of your testimonial widgets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload/URL Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={useLogoUrl ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseLogoUrl(true)}
                    >
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={!useLogoUrl ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseLogoUrl(false)}
                    >
                      Upload
                    </Button>
                  </div>
                </div>

                {useLogoUrl ? (
                  <CustomFormField
                    type="url"
                    control={form.control}
                    name="logoUrl"
                    label=""
                    placeholder="https://example.com/logo.png"
                    description="Provide a URL to your logo image"
                    optional
                  />
                ) : (
                  <CustomFormField
                    type="file"
                    control={form.control}
                    name="logoUrl"
                    label=""
                    description="Upload your logo image (drag & drop or click to browse)"
                    optional
                    onChange={handleLogoUpload}
                  />
                )}
              </div>

              <Separator />

              {/* Brand Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  name="brandColorPrimary"
                  type="color"
                  label="Primary Brand Color"
                  description="Choose your primary brand color for testimonial widgets"
                  optional
                  placeholder="#FF5733"
                />

                <CustomFormField
                  control={form.control}
                  name="brandColorSecondary"
                  type="color"
                  label="Secondary Brand Color"
                  description="Choose your secondary brand color for accents and highlights"
                  optional
                  placeholder="#33C3FF"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
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
                  control={form.control}
                  name="twitter"
                  label="Twitter"
                  placeholder="https://twitter.com/yourhandle"
                  optional
                />

                <CustomFormField
                  type="url"
                  control={form.control}
                  name="linkedin"
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/yourprofile"
                  optional
                />

                <CustomFormField
                  type="url"
                  control={form.control}
                  name="github"
                  label="GitHub"
                  placeholder="https://github.com/yourusername"
                  optional
                />

                <CustomFormField
                  type="url"
                  control={form.control}
                  name="facebook"
                  label="Facebook"
                  placeholder="https://facebook.com/yourpage"
                  optional
                />

                <CustomFormField
                  type="url"
                  control={form.control}
                  name="instagram"
                  label="Instagram"
                  placeholder="https://instagram.com/yourhandle"
                  optional
                />

                <CustomFormField
                  type="url"
                  control={form.control}
                  name="youtube"
                  label="YouTube"
                  placeholder="https://youtube.com/@yourchannel"
                  optional
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags & Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Tags & Organization</CardTitle>
              <CardDescription>
                Add tags for internal categorization and search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tagsInput">
                  Tags{" "}
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal ml-2"
                  >
                    Optional
                  </Badge>
                </Label>
                <Input
                  id="tagsInput"
                  placeholder="saas, startup, productivity (comma-separated)"
                  {...form.register("tagsInput")}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Project
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
