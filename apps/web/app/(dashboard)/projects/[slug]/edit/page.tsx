"use client";

import { use } from "react";
import { projects } from "@/lib/queries";
import { LoadingStars } from "@/components/loader";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { InlineLoader } from "@/components/loader";

interface ProjectEditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const projectEditSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project name is required" })
    .max(255, { message: "Project name must be less than 255 characters" }),
  description: z
    .string()
    .max(1000, { message: "Description must be less than 1000 characters" }),
  isActive: z.boolean(),
});

type ProjectEditFormValues = z.infer<typeof projectEditSchema>;

const ProjectEditPage = ({ params }: ProjectEditPageProps) => {
  const router = useRouter();
  const { slug } = use(params);

  const { data: project, isLoading: isLoadingProject } =
    projects.queries.useDetail(slug);
  const updateProject = projects.mutations.useUpdate(slug);

  const form = useForm<ProjectEditFormValues>({
    resolver: zodResolver(projectEditSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Update form when project data loads
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || "",
        isActive: project.isActive,
      });
    }
  }, [project, form]);

  const onSubmit = async (data: ProjectEditFormValues) => {
    try {
      await updateProject.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        isActive: data.isActive,
      });
      router.push(`/projects/${slug}`);
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

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
    <div className="flex flex-col gap-6 w-full h-full p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/projects/${slug}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground mt-1">
            Update your project settings
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Make changes to your project information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Project" {...field} />
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief description of your project"
                          className="resize-none"
                          rows={4}
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

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Project Status
                        </FormLabel>
                        <FormDescription>
                          Inactive projects won't accept new testimonial
                          submissions.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      updateProject.isPending || !form.formState.isDirty
                    }
                  >
                    {updateProject.isPending && (
                      <InlineLoader className="mr-2 h-4 w-4" />
                    )}
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Link href={`/projects/${slug}`}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={updateProject.isPending}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectEditPage;
