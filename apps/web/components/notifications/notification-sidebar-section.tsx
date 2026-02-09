"use client";

import { Bell } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useNotificationStore } from "@/store/notification-store";
import {
  useNotificationList,
  useUnreadCount,
} from "@/lib/queries/notifications";
import { useAbly } from "@/components/ably-provider";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@workspace/ui/components/sidebar";

export function NotificationSidebarSection() {
  const { toggleCenter } = useNotificationStore();
  const { isConnected } = useAbly();
  const { data: countData } = useUnreadCount(isConnected);
  const { data: listData } = useNotificationList();

  const unreadCount = countData?.data?.count || 0;
  const recentNotifications =
    listData?.pages[0]?.data?.notifications?.slice(0, 3) || [];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild onClick={toggleCenter} className="">
          <Button
            className="justify-start w-full has-[>svg]:px-0 group-data-[collapsible=icon]:px-0 relative"
            variant="ghost"
          >
            <div className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="flex-1 text-left">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </SidebarMenuButton>

        {recentNotifications.length > 0 && (
          <SidebarMenuSub>
            {recentNotifications.map((notification) => (
              <SidebarMenuSubItem key={notification.id}>
                <SidebarMenuSubButton
                  onClick={toggleCenter}
                  className={cn(
                    "flex-col items-start gap-1 py-2 h-auto",
                    !notification.isRead && "bg-info-highlight-bg",
                  )}
                >
                  <div className="flex items-start gap-2 w-full">
                    {!notification.isRead && (
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                onClick={toggleCenter}
                className="justify-center text-xs text-muted-foreground"
              >
                View all notifications
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
