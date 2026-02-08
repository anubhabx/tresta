"use client";

import { cn } from "@workspace/ui/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    value: string;
  }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function SidebarNav({
  className,
  items,
  activeTab,
  onTabChange,
  ...props
}: SidebarNavProps) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => onTabChange(item.value)}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "justify-start w-full",
            activeTab === item.value
              ? "bg-zinc-800 text-white"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </button>
      ))}
    </nav>
  );
}
