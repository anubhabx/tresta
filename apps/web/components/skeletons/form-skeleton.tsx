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
