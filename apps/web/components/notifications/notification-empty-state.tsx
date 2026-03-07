import { Bell } from "lucide-react";

export function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center h-full">
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 mb-4">
        <Bell className="h-6 w-6 text-foreground/40" />
      </div>
      <h3 className="text-sm font-medium text-foreground/90 mb-1">
        No notifications yet
      </h3>
      <p className="text-sm text-foreground/50 max-w-sm">
        When you receive notifications, they'll appear here.
      </p>
    </div>
  );
}
