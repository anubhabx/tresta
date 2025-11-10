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
import { FolderIcon, TrashIcon, EditIcon } from "lucide-react";
import type { Project } from "@/types/api";

interface ProjectHeaderProps {
  project: Project;
  slug: string;
  onDelete: () => Promise<void>;
}

export function ProjectHeader({ project, slug, onDelete }: ProjectHeaderProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
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
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
            /{project.slug}
          </p>
          {project.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {project.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Created{" "}
            {formatDistanceToNow(new Date(project.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Link href={`/projects/${slug}/edit`} className="flex-1 sm:flex-none">
          <Button variant="outline" size="sm" className="w-full touch-manipulation min-h-[44px] sm:min-h-0">
            <EditIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none touch-manipulation min-h-[44px] sm:min-h-0">
              <TrashIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
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
  );
}
