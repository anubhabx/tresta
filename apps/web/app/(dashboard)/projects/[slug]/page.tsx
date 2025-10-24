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
  CardTitle
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@workspace/ui/components/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@workspace/ui/components/alert-dialog";
import {
  FolderIcon,
  MessageSquareIcon,
  LayoutGridIcon,
  SettingsIcon,
  TrashIcon,
  EditIcon,
  LinkIcon,
  CopyIcon,
  ExternalLinkIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { TestimonialList } from "@/components/testimonial-list";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@workspace/ui/components/avatar";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const ProjectPage = ({ params }: ProjectPageProps) => {
  const router = useRouter();
  const { slug } = use(params);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: project, isLoading: isLoadingProject } =
    projects.queries.useDetail(slug as string);
  const deleteProject = projects.mutations.useDelete(slug as string);

  const collectionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/testimonials/${slug}`
      : "";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(collectionUrl);
    toast.success("Collection URL copied to clipboard!");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject.mutateAsync();
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
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
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="mt-1 rounded-lg w-12 h-12">
            <AvatarImage
              src={project.logoUrl!}
              alt={project.name}
              className="object-cover"

            />

            <AvatarFallback className="bg-muted text-muted-foreground p-3 rounded-lg">
              <FolderIcon className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              {!project.isActive && (
                <Badge variant="outline" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">/{project.slug}</p>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {project.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Created{" "}
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/projects/${slug}/edit`}>
            <Button variant="outline" size="sm">
              <EditIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  project "{project.name}" and all associated testimonials and
                  widgets.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Project"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Testimonials
            </CardTitle>
            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project._count?.testimonials || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Testimonials collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Widgets
            </CardTitle>
            <LayoutGridIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project._count?.widgets || 0}
            </div>
            <p className="text-xs text-muted-foreground">Display widgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.isActive ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-muted-foreground">Project status</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection URL</CardTitle>
              <CardDescription>
                Share this URL to collect testimonials from your customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm truncate">
                  {collectionUrl}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <a
                  href={collectionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                </a>
              </div>
              <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <LinkIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    Share this link with your customers
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Anyone with this link can submit a testimonial for your
                    project. You can moderate submissions before they appear
                    publicly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Project overview at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Project ID
                  </span>
                  <span className="text-sm font-mono">{project.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Updated
                  </span>
                  <span className="text-sm">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Testimonials
                  </span>
                  <span className="text-sm font-medium">
                    {project._count?.testimonials || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Active Widgets
                  </span>
                  <span className="text-sm font-medium">
                    {project._count?.widgets || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>
                Manage and moderate testimonials for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialList projectSlug={slug} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Widgets</CardTitle>
              <CardDescription>
                Create widgets to display testimonials on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LayoutGridIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No widgets created
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first widget to display testimonials on your site
                </p>
                <Button disabled>
                  <LayoutGridIcon className="h-4 w-4 mr-2" />
                  Create Widget (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Configure your project settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Project Status</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Inactive projects won't accept new testimonial submissions
                  </p>
                  <Badge variant={project.isActive ? "default" : "secondary"}>
                    {project.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2 text-destructive">
                    Danger Zone
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete this project and all associated data
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Project
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the project "{project.name}" and all associated
                          testimonials and widgets.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete Project"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPage;
