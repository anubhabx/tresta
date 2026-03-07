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

export function NotificationItem({
  notification,
  onClose,
}: NotificationItemProps) {
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
        "w-full text-left p-5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.05] last:border-b-0",
        !notification.isRead && "bg-white/[0.01]",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1.5 flex h-2 w-2 items-center justify-center flex-shrink-0">
          {!notification.isRead && (
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p
              className={cn(
                "text-sm font-medium text-foreground/90",
                !notification.isRead && "text-foreground font-semibold",
              )}
            >
              {notification.title}
            </p>
            <span className="text-[11px] text-foreground/40 font-medium whitespace-nowrap mt-0.5">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-foreground/60 line-clamp-2">
            {notification.message}
          </p>
        </div>
      </div>
    </button>
  );
}
