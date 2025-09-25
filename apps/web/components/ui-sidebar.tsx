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
  PlusIcon,
  UserIcon
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import { FaGithub } from "react-icons/fa";
import ProjectForm from "./project-form";
import { useRouter } from "next/navigation";

const products = [
  {
    name: "Portfolio",
    href: "/products/1"
  },
  {
    name: "My SaaS Product",
    href: "/products/2"
  }
];

const UISidebar = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const pathname = usePathname();

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
              <Button className="justify-start w-full" variant="ghost">
                <LayoutDashboardIcon className="h-4 w-4" />
                Dashboard
              </Button>
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

            <SidebarMenuAction>
              <ProjectForm />
            </SidebarMenuAction>

            {products.length > 0 && (
              <SidebarMenuSub>
                {products.slice(0, 3).map((product) => (
                  <SidebarMenuSubItem key={product.href}>
                    <Link href={product.href} className="w-full">
                      <SidebarMenuSubButton
                        isActive={pathname === product.href}
                        asChild
                      >
                        <Button
                          className="justify-start w-full"
                          variant="ghost"
                          size="sm"
                        >
                          {product.name}
                        </Button>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                ))}
                {products.length > 3 && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Button
                        className="justify-start w-full text-muted-foreground"
                        variant="ghost"
                        size="sm"
                      >
                        All Products
                      </Button>
                    </SidebarMenuSubButton>
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
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.firstName || "User Avatar"}
                    />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
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
