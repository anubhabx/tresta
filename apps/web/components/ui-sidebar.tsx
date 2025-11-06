"use client";

import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuSkeleton
} from "@workspace/ui/components/sidebar";
import {
  ChevronUp,
  Layers2Icon,
  LayoutDashboardIcon,
  UserIcon,
  PlusIcon
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu";
import { CustomAvatar } from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import { FaGithub } from "react-icons/fa";
import { projects } from "@/lib/queries";

const UISidebar = () => {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  // Fetch projects list - will automatically update when new project is created
  const { data: projectsData, isLoading: isLoadingProjects } =
    projects.queries.useList(1, 10);

  const userProjects = projectsData?.data || [];

  return (
    <Sidebar className="border-none group/collapsible" collapsible="icon">
      <SidebarHeader className="px-4 py-3 text-lg font-semibold flex flex-row items-center justify-start">
        <FaGithub className="group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
        <span className="group-data-[collapsible=icon]:hidden">Tresta</span>
      </SidebarHeader>

      <Separator />

      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname === "/dashboard"} asChild>
              <Link href="/dashboard" className="px-3">
                <Button
                  className="justify-start w-full has-[>svg]:px-0"
                  variant="ghost"
                >
                  <LayoutDashboardIcon className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname === "/projects"} asChild>
              <Link href="/projects" className="px-3">
                <Button
                  className="justify-start w-full has-[>svg]:px-0"
                  variant="ghost"
                >
                  <Layers2Icon className="h-4 w-4" />
                  Projects
                </Button>
              </Link>
            </SidebarMenuButton>

            <SidebarMenuAction asChild>
              <Link href="/projects/new" title="Create New Project">
                <PlusIcon className="h-6 w-6 cursor-pointer hover:bg-primary/50 transition-colors rounded-[2px]" />
              </Link>
            </SidebarMenuAction>

            {isLoadingProjects && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSkeleton className="h-8 w-full" />
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}

            {!isLoadingProjects && userProjects.length > 0 && (
              <SidebarMenuSub>
                {userProjects.slice(0, 3).map((project) => (
                  <SidebarMenuSubItem key={project.id}>
                    <Link href={`/projects/${project.slug}`} className="w-full">
                      <SidebarMenuSubButton
                        isActive={pathname === `/projects/${project.slug}`}
                        asChild
                      >
                        <Button
                          className="justify-start w-full"
                          variant="ghost"
                          size="sm"
                        >
                          {project.name}
                        </Button>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                ))}
                {userProjects.length > 3 && (
                  <SidebarMenuSubItem>
                    <Link href="/projects" className="w-full">
                      <SidebarMenuSubButton asChild>
                        <Button
                          className="justify-start w-full text-muted-foreground"
                          variant="ghost"
                          size="sm"
                        >
                          View All ({userProjects.length})
                        </Button>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                )}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 border-t border-border">
        {!isLoaded && <SidebarMenuSkeleton className="h-8 w-full" />}

        {isLoaded && user && (
          <SidebarMenuButton asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="justify-start w-full truncate overflow-ellipsis"
                  variant="ghost"
                >
                  <CustomAvatar
                    src={user.imageUrl}
                    name={user.firstName || "User"}
                    alt="sidebar-profile-image"
                    className="size-6"
                  />
                  <span className="truncate overflow-ellipsis flex-1 text-left">
                    {user.firstName ||
                      user.username ||
                      user.emailAddresses[0]?.emailAddress ||
                      "Account"}
                  </span>
                  <ChevronUp className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="border-border">
                <Link href="/account">
                  <Button
                    className="justify-start w-full"
                    variant="ghost"
                    size="sm"
                  >
                    Account Settings
                  </Button>
                </Link>

                <Button
                  className="justify-start w-full"
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <SignOutButton redirectUrl="/sign-in" />
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default UISidebar;
