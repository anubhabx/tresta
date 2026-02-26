import { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface CollectionPageShellProps {
  children: ReactNode;
  centered?: boolean;
  className?: string;
}

export function CollectionPageShell({
  children,
  centered = false,
  className,
}: CollectionPageShellProps) {
  return (
    <div className="min-h-screen bg-muted/20 py-8 sm:py-10">
      <div
        className={cn(
          "py-6 px-4 md:px-8",
          centered && "flex min-h-[calc(100svh-4rem)] items-center",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
