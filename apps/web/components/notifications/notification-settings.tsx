"use client";

import {
  useNotificationPreferences,
  useUpdatePreferences,
} from "@/lib/queries/notifications";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function NotificationSettings() {
  const { data, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdatePreferences();

  const preferences = data?.data;

  const handleToggleEmail = async (enabled: boolean) => {
    try {
      await updatePreferences.mutateAsync(enabled);
      toast.success(
        enabled
          ? "Email notifications enabled"
          : "Email notifications disabled",
      );
    } catch (error) {
      toast.error("Failed to update preferences");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Email Notifications Section */}
      <div className="border-b border-border pb-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Email Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Control when you receive email notifications
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled" className="text-sm font-medium">
                Enable email notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences?.emailEnabled ?? true}
              onCheckedChange={handleToggleEmail}
              disabled={updatePreferences.isPending}
            />
          </div>

          {preferences?.emailEnabled && (
            <div className="rounded-lg bg-muted p-4 space-y-2 max-w-md">
              <h4 className="text-sm font-medium">What you'll receive:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Immediate emails for critical alerts</li>
                <li>Daily digest of non-critical notifications (9 AM UTC)</li>
                <li>Updates about your projects and testimonials</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Notifications Section */}
      <div className="border-b border-border pb-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Real-time Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            In-app notifications are always enabled
          </p>
        </div>

        <div className="rounded-lg bg-muted p-4 max-w-md">
          <p className="text-sm text-muted-foreground">
            You'll always receive real-time notifications in the app via the
            notification bell. These appear instantly when you're logged in.
          </p>
        </div>
      </div>

      {/* Notification Types Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold">Notification Types</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Types of notifications you may receive
          </p>
        </div>

        <div className="space-y-4 max-w-md">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-info-highlight-bg p-2 mt-0.5">
              <svg
                className="h-4 w-4 text-info-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium">New Testimonials</h4>
              <p className="text-xs text-muted-foreground">
                When someone submits a new testimonial for your project
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-destructive-muted p-2 mt-0.5">
              <svg
                className="h-4 w-4 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium">Flagged Content</h4>
              <p className="text-xs text-muted-foreground">
                When a testimonial is flagged by moderation
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-success-muted p-2 mt-0.5">
              <svg
                className="h-4 w-4 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium">Approvals & Updates</h4>
              <p className="text-xs text-muted-foreground">
                When testimonials are approved or rejected
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-full bg-warning-muted p-2 mt-0.5">
              <svg
                className="h-4 w-4 text-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium">Security Alerts</h4>
              <p className="text-xs text-muted-foreground">
                Important security updates about your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
