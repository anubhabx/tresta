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
  console.log("User in Sidebar:", user);

  const pathname = usePathname();

  return (
    <Sidebar className="border-none group/collapsible" collapsible="icon">
      <SidebarHeader className="py-6 px-4 text-lg font-semibold">
        Tresta
      </SidebarHeader>

      <SidebarContent className="px-2">
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
            <SidebarMenuButton isActive={pathname === "/products"} asChild>
              <Button className="justify-start w-full" variant="ghost">
                <Layers2Icon className="h-4 w-4" />
                Products
              </Button>
            </SidebarMenuButton>

            <SidebarMenuAction asChild>
              <Button
                className="size-7 p-0"
                variant="ghost"
                size="icon"
                aria-label="Create new product"
                title="Create new product"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
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

      <SidebarFooter className="px-4 py-2 pb-6">
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
