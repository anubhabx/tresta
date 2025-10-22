import React, { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@workspace/ui/components/dialog";
import { InlineLoader } from "./loader";
import { CustomFormField } from "./custom-form-field";
import { projects } from "@/lib/queries";

const projectFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project name is required" })
    .max(255, { message: "Project name must be less than 255 characters" }),
  description: z
    .string()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional(),
  slug: z
    .string()
    .min(1, { message: "Project slug is required" })
    .max(255, { message: "Project slug must be less than 255 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens"
    })
});

interface ProjectFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ trigger, onSuccess }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const createProject = projects.mutations.useCreate();

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: ""
    }
  });

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  const onSubmit = async (data: z.infer<typeof projectFormSchema>) => {
    try {
      // Use TanStack Query mutation
      const newProject = await createProject.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        slug: data.slug
      });

      // Show success message
      toast.success("Project created successfully!");

      // Reset form and close dialog
      form.reset();
      setOpen(false);

      // Call success callback if provided
      onSuccess?.();

      // Optionally redirect to the new project page
      // router.push(`/projects/${newProject.slug}`);
    } catch (error) {
      console.error("Error creating project:", error);

      // Handle errors from backend
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create project");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleNameChange = (name: string) => {
    form.setValue("name", name);

    const currentSlug = form.getValues("slug");
    const generatedSlug = generateSlug(name);

    if (!currentSlug || currentSlug === generateSlug(form.getValues("name"))) {
      form.setValue("slug", generatedSlug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button asChild>
            <PlusIcon className="h-4 w-4 mr-2 rounded-sm" />
            Create Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project to start collecting testimonials.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomFormField
              type="text"
              control={form.control}
              name="name"
              label="Project Name"
              placeholder="My Awesome Project"
              description="The display name for your project."
              required
              onChange={(value) => handleNameChange(value)}
            />

            <CustomFormField
              type="text"
              control={form.control}
              name="slug"
              label="Project Slug"
              placeholder="my-awesome-project"
              description="A unique identifier for your project URL. We generate this from the project name, but you can customize it."
              required
            />

            <CustomFormField
              type="textarea"
              control={form.control}
              name="description"
              label="Description"
              placeholder="A brief description of your project"
              description="Optional description to help users identify this project."
              optional
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createProject.isPending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending && (
                  <InlineLoader className="mr-2 h-4 w-4" />
                )}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
