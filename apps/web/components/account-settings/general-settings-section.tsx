"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { ProfileImageSection } from "./profile-image-section";
import { ProfileInformationSection } from "./profile-information-section";
import { PasswordSection } from "./password-section";
import { ConnectedAccountsSection } from "./connected-accounts-section";
import { NotificationSettings } from "../notification-settings";

interface GeneralSettingsSectionProps {
  user: any;
  hasPassword: boolean;
  externalAccounts: any[];
}

export function GeneralSettingsSection({
  user,
  hasPassword,
  externalAccounts,
}: GeneralSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile & Account</CardTitle>
        <CardDescription>
          Manage your profile, security, and notification preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />

        {/* Profile Image */}
        <ProfileImageSection user={user} />

        <Separator />

        {/* Profile Information */}
        <ProfileInformationSection user={user} />

        <Separator />

        {/* Password */}
        <PasswordSection user={user} hasPassword={hasPassword} />

        <Separator />

        {/* Notification Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Notifications
          </h4>
          <NotificationSettings />
        </div>

        {/* Connected Accounts (only if user has external accounts) */}
        {externalAccounts.length > 0 && (
          <>
            <Separator />
            <ConnectedAccountsSection externalAccounts={externalAccounts} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
