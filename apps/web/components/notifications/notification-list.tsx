"use client";

import { useNotificationList } from "@/lib/queries/notifications";
import { NotificationItem } from "./notification-item";
import { NotificationEmptyState } from "./notification-empty-state";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotificationList();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const notifications = data?.pages.flatMap((page) => page.data.notifications) || [];

  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={onClose}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
