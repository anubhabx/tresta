"use client";

import { cn } from "@workspace/ui/lib/utils";

interface KeyboardShortcutBadgeProps {
  shortcut: string;
  className?: string;
}

export function KeyboardShortcutBadge({
  shortcut,
  className,
}: KeyboardShortcutBadgeProps) {
  return (
    <kbd
      className={cn(
        "hidden sm:inline-flex ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded border bg-muted/50 text-muted-foreground border-border/50",
        className,
      )}
    >
      {shortcut}
    </kbd>
  );
}
