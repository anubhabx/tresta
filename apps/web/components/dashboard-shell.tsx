"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import UISidebar from "@/components/ui-sidebar";
import UIBreadcrumb from "@/components/ui-breadcrumbs";
import { useUIStore } from "@/store/ui-store";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Client component wrapper that handles UI state with Zustand
 * This allows the parent layout to remain a Server Component
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const pathname = usePathname();

  /**
   * Conditionally show "New Project" button based on current route
   * Button appears on:
   * - /dashboard - Main dashboard page
   * - /projects - Projects list page
   *
   * Button hidden on:
   * - /projects/new - New project form
   * - /projects/[slug] - Project detail page
   * - /projects/[slug]/edit - Edit project form
   */
  const showNewProjectButton =
    pathname === "/dashboard" || pathname === "/projects";

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={toggleSidebar}>
      <TooltipProvider>
        <div className="flex min-h-svh w-full overflow-x-hidden">
          <UISidebar />
          <div className="flex-1 w-full min-w-0 p-0 sm:p-2">
            <div className="w-full h-full flex flex-col bg-background sm:rounded-md px-2 sm:px-4 sm:shadow-lg relative overflow-x-hidden">
              <div className="w-full bg-background z-10 sticky top-0">
                <div className="border-b border-border py-2 flex gap-2 items-center text-sm relative">
                  <SidebarTrigger />
                  <UIBreadcrumb />
                </div>
              </div>
              <div className="w-full min-w-0 overflow-x-hidden">
                {children}
              </div>
              {showNewProjectButton && (
                <Link href="/projects/new" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                  <Button className="flex items-center gap-2 shadow-lg h-12 sm:h-10 px-4 sm:px-4">
                    <PlusIcon className="h-5 w-5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">New Project</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
