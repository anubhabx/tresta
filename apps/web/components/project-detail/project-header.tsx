"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import {
  FolderIcon,
  TrashIcon,
  EditIcon,
  Link2,
  Code,
  Check,
  MessageSquare,
  LayoutGrid,
} from "lucide-react";
import { EmbedDialog } from "./embed-dialog";
import type { Project } from "@/types/api";

interface ProjectHeaderProps {
  project: Project;
  slug: string;
  onDelete: () => Promise<void>;
}

export function ProjectHeader({ project, slug, onDelete }: ProjectHeaderProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
  };

  const handleCopyCollectionLink = async () => {
    const collectionUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/collect/${slug}`
        : "";
    await navigator.clipboard.writeText(collectionUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const testimonialCount = project._count?.testimonials ?? 0;
  const widgetCount = project._count?.widgets ?? 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Top Row: Avatar + Info + Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Avatar and Info */}
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
            <Avatar className="rounded-lg w-12 h-12 sm:w-14 sm:h-14">
              <AvatarImage
                src={project.logoUrl!}
                alt={project.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-transparent text-primary rounded-lg">
                <FolderIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              {!project.isActive && (
                <Badge variant="outline" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono">
              /{project.slug}
            </p>
            {project.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {project.description}
              </p>
            )}

            {/* Mini Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {testimonialCount}
                </span>
                <span className="hidden sm:inline">testimonials</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <LayoutGrid className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {widgetCount}
                </span>
                <span className="hidden sm:inline">widgets</span>
              </div>
              <span className="text-xs text-muted-foreground">
                · Created{" "}
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions (primary) */}
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCopyCollectionLink}
          >
            {linkCopied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Collection Link</span>
              </>
            )}
          </Button>

          <EmbedDialog
            project={project}
            trigger={
              <Button size="sm" className="gap-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">Get Embed Code</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Bottom Row: Secondary Actions */}
      <div className="flex items-center gap-2 border-t border-border pt-4">
        <Link href={`/projects/${slug}/edit`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <EditIcon className="h-4 w-4" />
            Edit Project
          </Button>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <TrashIcon className="h-4 w-4" />
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
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
  );
}
