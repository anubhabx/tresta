"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Star,
  Mail,
  User,
  Video,
  Briefcase,
  Building2,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import type { Testimonial } from "@/types/api";
import { CustomAvatar } from "@workspace/ui/components/avatar";

import { Card, CardContent } from "@workspace/ui/components/card";
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
import { cn } from "@workspace/ui/lib/utils";
import { StatusBadge, TestimonialActions } from "./testimonials";
import { Button } from "@workspace/ui/components/button";

interface TestimonialCardProps {
  testimonial: Testimonial;
  onPublish: (id: string) => Promise<void>;
  onUnpublish: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TestimonialCard({
  testimonial,
  onPublish,
  onUnpublish,
  onDelete,
}: TestimonialCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } catch (error: any) {
      // Error handling done by parent component
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (testimonial.isPublished) {
      return (
        <Badge variant="outline" className="border-primary/20 text-primary">
          <Eye className="h-3 w-3 mr-1" />
          Published
        </Badge>
      );
    }
    if (testimonial.isApproved) {
      return (
        <Badge variant="outline">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Pending
      </Badge>
    );
  };

  const getModerationBadge = () => {
    if (!testimonial.moderationStatus) return null;

    switch (testimonial.moderationStatus) {
      case "APPROVED":
        return (
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Moderated
          </Badge>
        );
      case "FLAGGED":
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-destructive/30 text-destructive"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Flagged
            </Badge>
            {testimonial.moderationFlags &&
              Array.isArray(testimonial.moderationFlags) &&
              testimonial.moderationFlags.length > 0 && (
                <div className="p-2 rounded-md bg-muted/50 border text-xs">
                  <p className="font-medium mb-1">Issues:</p>
                  <ul className="space-y-0.5">
                    {testimonial.moderationFlags
                      .slice(0, 3)
                      .map((flag: string, i: number) => (
                        <li key={i} className="text-muted-foreground">
                          • {flag}
                        </li>
                      ))}
                    {testimonial.moderationFlags.length > 3 && (
                      <li className="text-muted-foreground">
                        +{testimonial.moderationFlags.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-destructive/30 text-destructive"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
            {testimonial.moderationFlags &&
              Array.isArray(testimonial.moderationFlags) &&
              testimonial.moderationFlags.length > 0 && (
                <div className="p-2 rounded-md bg-muted/50 border text-xs">
                  <p className="font-medium mb-1">Reasons:</p>
                  <ul className="space-y-0.5">
                    {testimonial.moderationFlags
                      .slice(0, 3)
                      .map((flag: string, i: number) => (
                        <li key={i} className="text-muted-foreground">
                          • {flag}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
          </div>
        );
      case "PENDING":
      default:
        return null;
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <CustomAvatar
              src={testimonial.authorAvatar}
              name={testimonial.authorName}
              alt={testimonial.authorName}
              size="md"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">
                  {testimonial.authorName}
                </h3>
                {testimonial.isOAuthVerified && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/5 border-primary/20"
                  >
                    <Shield className="h-3 w-3 mr-1 text-primary" />
                    Verified
                  </Badge>
                )}
              </div>
              {testimonial.authorEmail && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{testimonial.authorEmail}</span>
                </div>
              )}
              {(testimonial.authorRole || testimonial.authorCompany) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {testimonial.authorRole}
                  {testimonial.authorRole && testimonial.authorCompany && " · "}
                  {testimonial.authorCompany}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="ml-2 flex-shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Content */}
        <p className="text-sm mb-4 whitespace-pre-wrap">
          {testimonial.content}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          {testimonial.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "h-3 w-3",
                    index < testimonial.rating!
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/30",
                  )}
                />
              ))}
              <span className="ml-1">{testimonial.rating}/5</span>
            </div>
          )}
          <span>
            {formatDistanceToNow(new Date(testimonial.createdAt), {
              addSuffix: true,
            })}
          </span>
          {testimonial.type === "VIDEO" && (
            <div className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              <span>Video</span>
            </div>
          )}
        </div>

        {/* Video Link */}
        {testimonial.videoUrl && (
          <div className="mb-4 p-3 rounded-md bg-muted/50 border">
            <a
              href={testimonial.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1.5"
            >
              <Video className="h-4 w-4" />
              Watch video testimonial
            </a>
          </div>
        )}

        {/* Moderation Info */}
        {testimonial.moderationStatus &&
          testimonial.moderationStatus !== "PENDING" && (
            <div className="mb-4">{getModerationBadge()}</div>
          )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            {/* Publish/Unpublish - Only for approved testimonials */}
            {testimonial.isApproved && (
              <Tooltip>
                <TooltipTrigger asChild>
                  {testimonial.isPublished ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleAction(() => onUnpublish(testimonial.id))
                      }
                      disabled={isLoading}
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Unpublish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() =>
                        handleAction(() => onPublish(testimonial.id))
                      }
                      disabled={isLoading}
                    >
                      <Eye className="h-4 w-4 mr-1" />
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
                    <strong>{testimonial.authorName}</strong>? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleAction(() => onDelete(testimonial.id))}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
