"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ProfileImageSection,
  ProfileInformationSection,
  PasswordSection,
  ConnectedAccountsSection,
  DataPrivacySection,
  BillingSection,
} from "./account-settings";

interface AccountSettingsFormProps {
  user: NonNullable<ReturnType<typeof useUser>["user"]>;
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const { user: currentUser } = useUser();
  const router = useRouter();

  // Check if user has password authentication (not OAuth-only)
  const hasPassword = user.passwordEnabled;

  // Get external accounts (OAuth connections)
  const externalAccounts = user.externalAccounts || [];

  const handleAccountDeleted = () => {
    // Redirect to homepage after account deletion
    router.push("/");
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Profile Image */}
      <ProfileImageSection user={currentUser} />

      {/* Profile Information */}
      <ProfileInformationSection user={currentUser} />

      {/* Password Management */}
      <PasswordSection user={currentUser} hasPassword={hasPassword} />

      {/* Billing */}
      <BillingSection />

      {/* Connected Accounts */}
      {externalAccounts.length > 0 && (
        <ConnectedAccountsSection externalAccounts={externalAccounts} />
      )}

      {/* Data & Privacy */}
      <DataPrivacySection onAccountDeleted={handleAccountDeleted} />
    </div>
  );
}
