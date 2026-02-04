import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles - developer native: compact, clean
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow,border-color] duration-150",
        // Placeholder and selection
        "placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground",
        // File input styling
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Dark mode enhancement
        "dark:bg-input/30",
        // Focus state - Linear-style double ring (1px border + outer glow)
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
        // Error state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/30",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
