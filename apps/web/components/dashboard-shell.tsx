"use client";

import { ReactNode } from "react";
import UISidebar from "@/components/ui-sidebar";
import UIBreadcrumb from "@/components/ui-breadcrumbs";
import { useUIStore } from "@/store/ui-store";
import {
  SidebarProvider,
  SidebarTrigger
} from "@workspace/ui/components/sidebar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import {
  NotificationBadge,
  NotificationCenter
} from "@/components/notifications";
import { CommandPalette } from "@/components/command-palette";

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Client component wrapper that handles UI state with Zustand
 * This allows the parent layout to remain a Server Component
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={toggleSidebar}>
      <TooltipProvider>
        {/* Global Command Palette (⌘K) */}
        <CommandPalette />
        
        <div className="flex min-h-svh w-full overflow-x-hidden">
          <UISidebar />
          <div className="flex-1 w-full min-w-0 p-0 sm:p-2">
            <div className="w-full h-full flex flex-col bg-background sm:rounded-md px-2 sm:px-4 sm:shadow-lg relative overflow-x-hidden">
              <div className="w-full bg-background z-10 sticky top-0">
                <div className="border-b border-border py-2 flex gap-2 items-center text-sm relative">
                  <SidebarTrigger />
                  <UIBreadcrumb />
                  <div className="ml-auto flex items-center gap-2 sm:hidden">
                    <NotificationBadge />
                  </div>
                </div>
              </div>
              <NotificationCenter />
              <div className="w-full min-w-0 overflow-x-hidden">{children}</div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
