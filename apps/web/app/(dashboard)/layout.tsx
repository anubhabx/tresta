import UISidebar from "@/components/ui-sidebar";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import React, { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex items-center justify-center min-h-svh w-full">
          <UISidebar />
          <div className="flex-1 h-full p-2">{children}</div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
};

export default DashboardLayout;
