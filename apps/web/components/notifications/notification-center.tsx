"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { useNotificationStore } from "@/store/notification-store";
import { useMarkAllAsRead, useUnreadCount } from "@/lib/queries/notifications";
import { NotificationList } from "./notification-list";
import { useAbly } from "@/components/ably-provider";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";

export function NotificationCenter() {
  const { isOpen, closeCenter } = useNotificationStore();
  const { isConnected } = useAbly();
  const { data } = useUnreadCount(isConnected);
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = data?.data?.count || 0;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCenter}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <NotificationList onClose={closeCenter} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
