"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store/notification-store";
import { useUnreadCount } from "@/lib/queries/notifications";
import { useAbly } from "@/components/ably-provider";

export function NotificationBadge() {
  const { toggleCenter } = useNotificationStore();
  const { isConnected } = useAbly();
  const { data } = useUnreadCount(isConnected);

  const unreadCount = data?.data?.count || 0;
  const displayCount = unreadCount > 9 ? "9+" : unreadCount;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={toggleCenter}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {displayCount}
        </span>
      )}
    </Button>
  );
}
