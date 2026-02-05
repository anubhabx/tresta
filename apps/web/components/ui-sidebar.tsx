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
  SidebarMenuSkeleton,
} from "@workspace/ui/components/sidebar";
import {
  ChevronUp,
  CircleFadingArrowUp,
  Layers2Icon,
  LayoutDashboardIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { CustomAvatar } from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import { projects } from "@/lib/queries";
import { NotificationSidebarSection } from "@/components/notifications/notification-sidebar-section";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useUpgradeModal } from "@/components/billing/upgrade-modal";

import { useSubscription } from "@/hooks/use-subscription";

const UISidebar = () => {
  const { user, isLoaded } = useUser();
  const {
    isPro,
    isCanceled,
    isLoading: isLoadingSubscription,
  } = useSubscription();
  const pathname = usePathname();

  // Fetch projects list - will automatically update when new project is created
  const { data: projectsData, isLoading: isLoadingProjects } =
    projects.queries.useList(1, 10);

  const userProjects = projectsData?.data || [];

  return (
    <Sidebar
      className="border-none group/collapsible"
      collapsible="icon"
      variant="floating"
    >
      <SidebarHeader className="text-lg font-semibold flex flex-row items-center justify-start group-data-[collapsible=icon]:justify-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-foreground w-8! h-8!"
        >
          <Image
            src="/branding/tresta.svg"
            alt="Tresta logo"
            width={32}
            height={32}
            className="h-8! w-8! group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"
            priority
          />
          <span className="group-data-[collapsible=icon]:hidden">Tresta</span>
        </Link>
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
                <PlusIcon className="h-6 w-6 cursor-pointer transition-colors rounded-[2px]" />
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

      <SidebarFooter className="px-2 border-t border-border">
        {/* Notifications Section */}
        <NotificationSidebarSection />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Upgrade Plan Button */}
        {/* Subscription Actions */}
        {!isLoadingSubscription && (
          <>
            {!isPro && (
              <SidebarMenuButton
                onClick={() => useUpgradeModal.getState().open()}
                asChild
              >
                <Button
                  className="justify-start w-full p-2 text-primary hover:text-primary hover:bg-primary/10 font-medium has-[>svg]:px-0! group-data-[collapsible=icon]:px-1.5!"
                  variant="ghost"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30">
                      <CircleFadingArrowUp />
                    </span>
                    <span className="group-data-[collapsible=icon]:hidden">
                      Upgrade Plan
                    </span>
                  </div>
                </Button>
              </SidebarMenuButton>
            )}

            {isPro && isCanceled && (
              <SidebarMenuButton
                onClick={() => useUpgradeModal.getState().open()}
                asChild
              >
                <Button
                  className="justify-start w-full p-2 text-primary hover:text-primary hover:bg-primary/10 font-medium has-[>svg]:px-0! group-data-[collapsible=icon]:px-1.5!"
                  variant="ghost"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-rotate-ccw w-3 h-3"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
                        <path d="M3 5v7h7" />
                      </svg>
                    </span>
                    <span className="group-data-[collapsible=icon]:hidden">
                      Renew Plan
                    </span>
                  </div>
                </Button>
              </SidebarMenuButton>
            )}
          </>
        )}

        <Separator />

        {/* User Section */}
        {!isLoaded && <SidebarMenuSkeleton className="h-8 w-full" />}

        {isLoaded && user && (
          <SidebarMenuButton asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="justify-start px-2! w-full truncate overflow-ellipsis has-[>svg:px-0] group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                  variant="ghost"
                >
                  <CustomAvatar
                    src={user.imageUrl}
                    name={user.firstName || "User"}
                    alt="sidebar-profile-image"
                    className="size-6"
                  />
                  <span className="truncate overflow-ellipsis flex-1 text-left group-data-[collapsible=icon]:hidden">
                    {user.firstName ||
                      user.username ||
                      user.emailAddresses[0]?.emailAddress ||
                      "Account"}
                  </span>
                  <ChevronUp className="h-4 w-4 ml-2 group-data-[collapsible=icon]:hidden" />
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
