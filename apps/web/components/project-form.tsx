import React, { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PlusIcon } from "lucide-react";
import { projects } from "@/lib/queries";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
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
      <DialogTrigger asChild className="cursor-pointer hover:bg-primary/50 transition-colors rounded-sm">
        <PlusIcon
          className="h-6 w-6"
          onClick={() => {
            setOpen(true);
          }}
        />
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Awesome Project"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The display name for your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-project" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for your project URL. Only lowercase
                    letters, numbers, and hyphens allowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A brief description of your project"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help you identify this project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
