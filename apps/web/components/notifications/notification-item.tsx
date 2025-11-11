"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { useMarkAsRead } from "@/lib/queries/notifications";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
  };
  onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter();
  const markAsRead = useMarkAsRead();

  const handleClick = async () => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }

    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link);
    }

    // Close notification center
    onClose?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left p-4 hover:bg-accent transition-colors border-b last:border-b-0",
        !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        {!notification.isRead && (
          <div className="mt-2 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium mb-1",
            !notification.isRead && "font-semibold"
          )}>
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </button>
  );
}
