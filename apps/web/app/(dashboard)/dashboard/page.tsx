import React from "react";

import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@workspace/ui/components/breadcrumb";

const DashbardPage = () => {
  return (
    <div className="w-full h-full bg-background rounded-md px-4 shadow-lg">
      <div className="border-b border-border py-2 flex gap-2 items-center text-sm">
        <SidebarTrigger />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      DashbardPage
    </div>
  );
};

export default DashbardPage;
