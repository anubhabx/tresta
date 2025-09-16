"use client";

import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from "@workspace/ui/components/sidebar";
import { Layers2Icon, LayoutDashboardIcon, PlusIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@workspace/ui/components/tooltip";

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

      <SidebarFooter className="px-4 py-2">
        
      </SidebarFooter>
    </Sidebar>
  );
};

export default UISidebar;
