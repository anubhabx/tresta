import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";

// Individual form field skeleton
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" /> {/* Label */}
      <Skeleton className="h-10 w-full" /> {/* Input */}
    </div>
  );
}

// Textarea field skeleton
export function TextareaFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" /> {/* Label */}
      <Skeleton className="h-24 w-full" /> {/* Textarea */}
    </div>
  );
}

// Form section with multiple fields
export function FormSectionSkeleton({
  title = true,
  fields = 3,
}: {
  title?: boolean;
  fields?: number;
}) {
  return (
    <Card>
      <CardHeader>
        {title && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" /> {/* Section title */}
            <Skeleton className="h-4 w-96" /> {/* Section description */}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

// Project edit page skeleton
export function ProjectEditFormSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-4 w-32 mb-4" /> {/* Back link */}
        <Skeleton className="h-9 w-48 mb-2" /> {/* Title */}
        <Skeleton className="h-5 w-96" /> {/* Description */}
      </div>

      <div className="space-y-8">
        {/* Basic Info Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <TextareaFieldSkeleton />
          </CardContent>
        </Card>

        {/* URLs Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
          </CardContent>
        </Card>

        {/* Branding Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-32 rounded-lg" /> {/* Logo preview */}
            </div>
            <FormFieldSkeleton />
          </CardContent>
        </Card>

        {/* Social Links Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-88" />
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
          </CardContent>
        </Card>

        {/* Tags Section */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Separator */}
        <div className="border-t" />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Skeleton className="h-10 w-20" /> {/* Cancel */}
          <Skeleton className="h-10 w-32" /> {/* Save */}
        </div>
      </div>
    </div>
  );
}
