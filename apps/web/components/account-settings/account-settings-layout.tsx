"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, User, ShieldAlert, Key, Lock, Users } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarNav } from "./sidebar-nav";

interface AccountSettingsLayoutProps {
  children?: React.ReactNode;
  // We will likely pass the actual sections as props or render them here based on state
  // ideally, we render the content slots here.
  profileContent: React.ReactNode;
  billingContent: React.ReactNode;
  apiContent: React.ReactNode;
  dangerContent: React.ReactNode;
}

const sidebarNavItems = [
  {
    title: "General",
    href: "/account?tab=general",
    value: "general",
    icon: User,
  },
  {
    title: "Billing",
    href: "/account?tab=billing",
    value: "billing",
    icon: CreditCard,
  },
  {
    title: "API & Tokens",
    href: "/account?tab=api",
    value: "api",
    icon: Key,
  },
  {
    title: "Danger Zone",
    href: "/account?tab=danger",
    value: "danger",
    icon: ShieldAlert,
  },
];

export function AccountSettingsLayout({
  profileContent,
  billingContent,
  apiContent,
  dangerContent,
}: AccountSettingsLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default to 'general' if no tab is specified
  const currentTab = searchParams.get("tab") || "general";

  const handleTabChange = (value: string) => {
    // Update URL without full reload
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/account?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          Account & Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account settings, billing, and API tokens.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="shrink-0 lg:w-48">
          <SidebarNav
            items={sidebarNavItems}
            activeTab={currentTab}
            onTabChange={handleTabChange}
          />
        </aside>
        <div className="flex-1 lg:max-w-3xl">
          {currentTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {profileContent}
            </div>
          )}
          {currentTab === "billing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {billingContent}
            </div>
          )}
          {currentTab === "api" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {apiContent}
            </div>
          )}
          {currentTab === "danger" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {dangerContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
