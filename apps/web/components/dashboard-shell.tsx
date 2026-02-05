"use client";

import { ReactNode, useState, useEffect } from "react";
import UISidebar from "@/components/ui-sidebar";
import UIBreadcrumb from "@/components/ui-breadcrumbs";
import { useUIStore } from "@/store/ui-store";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import {
  NotificationBadge,
  NotificationCenter,
} from "@/components/notifications";
import { CommandPalette } from "@/components/command-palette";
import { cn } from "@workspace/ui/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Client component wrapper that handles UI state with Zustand
 * Enhanced with glass navbar and scroll detection
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for navbar border effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={toggleSidebar}>
      <TooltipProvider>
        {/* Global Command Palette (⌘K) */}
        <CommandPalette />

        <div className="flex min-h-svh w-full overflow-x-hidden">
          <UISidebar />
          <div className="flex-1 w-full min-w-0 p-0 sm:p-2">
            <div className="w-full h-full flex flex-col bg-background sm:rounded-md sm:shadow-lg relative overflow-x-hidden">
              {/* Glass Navbar */}
              <header
                className={cn(
                  "w-full z-10 sticky top-0",
                  "bg-background/80 backdrop-blur-md",
                  "transition-colors duration-200",
                  isScrolled && "border-b border-border",
                )}
                data-scrolled={isScrolled}
              >
                <div className="py-2 px-2 sm:px-4 flex gap-2 items-center text-sm">
                  <SidebarTrigger />
                  <UIBreadcrumb />

                  {/* Command Menu Hint (Desktop) */}
                  <div className="ml-auto flex items-center gap-3">
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                    <NotificationBadge />
                  </div>
                </div>
              </header>

              <NotificationCenter />

              {/* Main Content */}
              <main className="w-full min-w-0 overflow-x-hidden flex-1 px-2 sm:px-4">
                {children}
              </main>

              {/* Status Bar */}
              <footer className="shell-statusbar border-t border-border bg-background/80 backdrop-blur-sm px-3 flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Connected
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <span className="opacity-60">⌘K — Command Menu</span>
                  <span className="opacity-60">⌘B — Toggle Sidebar</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
