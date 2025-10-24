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
        <div className="flex items-center justify-center min-h-svh w-full">
          <UISidebar />
          <div className="flex-1 h-full p-2">
            <div className="w-full h-full flex flex-col bg-background rounded-md px-4 shadow-lg">
              <div className="border-b border-border py-2 flex gap-2 items-center text-sm relative">
                <SidebarTrigger />
                <UIBreadcrumb />
              </div>
              {children}
              {showNewProjectButton && (
                <Link href="/projects/new" className="fixed bottom-6 right-6">
                  <Button className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    <span>New Project</span>
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
