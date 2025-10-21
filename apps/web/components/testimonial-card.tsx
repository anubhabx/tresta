"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Calendar,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import type { Testimonial } from "@/types/api";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface TestimonialCardProps {
  testimonial: Testimonial;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onPublish: (id: string) => Promise<void>;
  onUnpublish: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TestimonialCard({
  testimonial,
  onApprove,
  onReject,
  onPublish,
  onUnpublish,
  onDelete,
}: TestimonialCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (
    action: () => Promise<void>,
    successMessage: string
  ) => {
    setIsLoading(true);
    try {
      await action();
      toast.success(successMessage);
    } catch (error: any) {
      toast.error(error?.message || "Action failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (testimonial.isPublished) {
      return (
        <Badge variant="default" className="bg-green-500">
          <Eye className="h-3 w-3 mr-1" />
          Published
        </Badge>
      );
    }
    if (testimonial.isApproved) {
      return (
        <Badge variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
        Pending
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {testimonial.authorName}
            </h3>
            {testimonial.authorEmail && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{testimonial.authorEmail}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            {testimonial.type === "VIDEO" && (
              <Badge variant="outline" className="text-xs">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
          </div>
        </div>

        {/* Rating */}
        {testimonial.rating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < testimonial.rating!
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              {testimonial.rating}/5
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {testimonial.content}
        </p>

        {testimonial.videoUrl && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <a
              href={testimonial.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1.5"
            >
              <Video className="h-4 w-4" />
              Watch video testimonial
            </a>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Submitted {formatDistanceToNow(new Date(testimonial.createdAt))}{" "}
            ago
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-4 border-t">
        <TooltipProvider>
          {/* Approve/Reject */}
          {!testimonial.isApproved && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() =>
                      handleAction(
                        () => onApprove(testimonial.id),
                        "Testimonial approved!"
                      )
                    }
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Approve
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Approve this testimonial</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sm:flex-none border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() =>
                      handleAction(
                        () => onReject(testimonial.id),
                        "Testimonial rejected"
                      )
                    }
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reject this testimonial</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Publish/Unpublish */}
          {testimonial.isApproved && (
            <Tooltip>
              <TooltipTrigger asChild>
                {testimonial.isPublished ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleAction(
                        () => onUnpublish(testimonial.id),
                        "Testimonial unpublished"
                      )
                    }
                    disabled={isLoading}
                  >
                    <EyeOff className="h-4 w-4 mr-1.5" />
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() =>
                      handleAction(
                        () => onPublish(testimonial.id),
                        "Testimonial published!"
                      )
                    }
                    disabled={isLoading}
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    Publish
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {testimonial.isPublished
                  ? "Hide from public widgets"
                  : "Show in public widgets"}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Delete */}
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete testimonial</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this testimonial from{" "}
                  <strong>{testimonial.authorName}</strong>? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    handleAction(
                      () => onDelete(testimonial.id),
                      "Testimonial deleted"
                    )
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
