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
              addSuffix: true,
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
  );
}
