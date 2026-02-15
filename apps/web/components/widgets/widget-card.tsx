"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import {
  LayoutGridIcon,
  Code2Icon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  CopyIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Widget } from "@/lib/queries/widgets";

interface WidgetCardProps {
  widget: Widget;
  onEdit: (widgetId: string) => void;
  onDelete: (widgetId: string) => Promise<void>;
  onViewEmbed: (widgetId: string) => void;
}

export function WidgetCard({
  widget,
  onEdit,
  onDelete,
  onViewEmbed,
}: WidgetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(widget.id);
      toast.success("Widget deleted successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete widget";
      toast.error(message);
      setIsDeleting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(widget.id);
    toast.success("Widget ID copied to clipboard!");
  };

  const getLayoutIcon = () => {
    const layout = widget.config?.layout || "carousel";
    return <LayoutGridIcon className="h-5 w-5" />;
  };

  const getLayoutLabel = () => {
    const layout = widget.config?.layout || "carousel";
    return layout.charAt(0).toUpperCase() + layout.slice(1);
  };

  const getThemeBadge = () => {
    const theme = widget.config?.theme || "light";
    return (
      <Badge variant="outline" className="text-xs">
        {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme
      </Badge>
    );
  };

  return (
    <Card className="border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-200">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              {getLayoutIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg">
                {getLayoutLabel()} Widget
              </CardTitle>
              <CardDescription className="text-xs mt-1 truncate">
                ID: {widget.id}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {getThemeBadge()}
            <Badge variant="secondary" className="text-xs">
              {getLayoutLabel()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-border/50">
            <span className="text-muted-foreground">Max Testimonials</span>
            <span className="font-medium">
              {widget.config?.maxTestimonials || "All"}
            </span>
          </div>
          {widget.config?.columns && (
            <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground">Columns</span>
              <span className="font-medium">{widget.config.columns}</span>
            </div>
          )}
          {widget.config?.autoRotate && (
            <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground">Auto Rotate</span>
              <Badge variant="outline" className="text-xs">
                {widget.config.rotateInterval
                  ? `${widget.config.rotateInterval / 1000}s`
                  : "Yes"}
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between text-xs sm:text-sm py-2">
            <span className="text-muted-foreground">Show Rating</span>
            <span className="font-medium">
              {widget.config?.showRating ? "Yes" : "No"}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(widget.createdAt))} ago
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewEmbed(widget.id)}
                className="flex-1 sm:flex-none touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <Code2Icon className="h-4 w-4 mr-1.5" />
                Embed
              </Button>
            </TooltipTrigger>
            <TooltipContent>View embed code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(widget.id)}
                className="flex-1 sm:flex-none touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <EditIcon className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit widget configuration</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyId}
                className="flex-1 sm:flex-none touch-manipulation min-h-[44px] sm:min-h-0"
              >
                <CopyIcon className="h-4 w-4 mr-1.5" />
                ID
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy widget ID</TooltipContent>
          </Tooltip>

          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation min-h-[44px] sm:min-h-0"
                    disabled={isDeleting}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete widget</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Widget</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this widget? This action
                  cannot be undone. The embed code will stop working.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Widget"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
