"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { widgets } from "@/lib/queries";
import { WidgetTabSkeleton } from "@/components/skeletons";
import {
  WidgetCard,
  WidgetEmptyState,
  EmbedCodeDialog,
} from "@/components/widgets";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";

interface ProjectWidgetsTabProps {
  projectSlug: string;
  projectId: string;
}

export function ProjectWidgetsTab({
  projectSlug,
  projectId,
}: ProjectWidgetsTabProps) {
  const router = useRouter();
  const [embedWidgetId, setEmbedWidgetId] = useState<string | null>(null);

  const { data: widgetsList, isLoading } = widgets.queries.useList(projectSlug);

  const handleEditWidget = (widgetId: string) => {
    router.push(`/projects/${projectSlug}/widgets/${widgetId}/edit`);
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      await widgets.mutations.useDelete(widgetId).mutateAsync();
    } catch (error: any) {
      throw error;
    }
  };

  const handleViewEmbed = (widgetId: string) => {
    setEmbedWidgetId(widgetId);
  };

  if (isLoading) {
    return <WidgetTabSkeleton />;
  }

  const hasWidgets = widgetsList && widgetsList.length > 0;

  return (
    <>
      <div className="space-y-6">
        {!hasWidgets ? (
          <WidgetEmptyState
            onCreateWidget={() =>
              router.push(`/projects/${projectSlug}/widgets/new`)
            }
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold">
                  Widgets ({widgetsList.length})
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Embed testimonials on your website
                </p>
              </div>
              <Button
                onClick={() =>
                  router.push(`/projects/${projectSlug}/widgets/new`)
                }
                className="touch-manipulation min-h-[44px] sm:min-h-0 w-full sm:w-auto"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Widget
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {widgetsList.map((widget) => (
                <WidgetCard
                  key={widget.id}
                  widget={widget}
                  onEdit={handleEditWidget}
                  onDelete={handleDeleteWidget}
                  onViewEmbed={handleViewEmbed}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Embed Code Dialog */}
      {embedWidgetId && (
        <EmbedCodeDialog
          widgetId={embedWidgetId}
          isOpen={!!embedWidgetId}
          onClose={() => setEmbedWidgetId(null)}
        />
      )}
    </>
  );
}
