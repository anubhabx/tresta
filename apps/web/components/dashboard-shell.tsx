"use client";

import { ReactNode } from "react";
import UISidebar from "@/components/ui-sidebar";
import UIBreadcrumb from "@/components/ui-breadcrumbs";
import { useUIStore } from "@/store/ui-store";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

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
        <div className="flex items-center justify-center min-h-svh w-full">
          <UISidebar />
          <div className="flex-1 h-full p-2">
            <div className="w-full h-full flex flex-col bg-background rounded-md px-4 shadow-lg">
              <div className="border-b border-border py-2 flex gap-2 items-center text-sm">
                <SidebarTrigger />
                <UIBreadcrumb />
              </div>
              {children}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
