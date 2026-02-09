import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";

// Account settings section skeleton
function AccountSectionSkeleton({
  hasAvatar = false,
  fields = 2,
}: {
  hasAvatar?: boolean;
  fields?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" /> {/* Section title */}
        <Skeleton className="h-4 w-96" /> {/* Section description */}
      </CardHeader>
      <CardContent className="space-y-4">
        {hasAvatar && (
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" /> {/* Avatar */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-28" /> {/* Button */}
            </div>
          </div>
        )}
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        ))}
        <div className="flex justify-end">
          <Skeleton className="h-9 w-24" /> {/* Save button */}
        </div>
      </CardContent>
    </Card>
  );
}

// Full account settings page skeleton
export function AccountSettingsSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" /> {/* Title */}
        <Skeleton className="h-5 w-96" /> {/* Description */}
      </div>

      <div className="space-y-6">
        {/* Profile Image Section */}
        <AccountSectionSkeleton hasAvatar={true} fields={0} />

        {/* Profile Information Section */}
        <AccountSectionSkeleton fields={3} />

        {/* Password Section */}
        <AccountSectionSkeleton fields={2} />

        {/* Connected Accounts Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded" />{" "}
                  {/* Provider icon */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" /> {/* Provider name */}
                    <Skeleton className="h-3 w-40" /> {/* Email */}
                  </div>
                </div>
                <Skeleton className="h-9 w-24" /> {/* Disconnect button */}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data & Privacy Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-32" /> {/* Export button */}
            </div>
            <div className="border-t pt-4">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-9 w-36 bg-destructive/10" />{" "}
              {/* Delete button */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
