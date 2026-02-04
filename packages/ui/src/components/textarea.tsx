import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles - developer native: compact, clean
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow,border-color] duration-150",
        // Placeholder
        "placeholder:text-muted-foreground/60",
        // Dark mode enhancement
        "dark:bg-input/30",
        // Focus state - Linear-style double ring (matches Input)
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
        // Error state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/30",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
