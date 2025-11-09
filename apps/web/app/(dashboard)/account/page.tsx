"use client";

import { useUser } from "@clerk/nextjs";
import { AccountSettingsSkeleton } from "@/components/skeletons/account-skeleton";
import { AccountSettingsForm } from "@/components/account-settings-form";

export default function AccountPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <AccountSettingsSkeleton />;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-muted-foreground">
          Please sign in to view account settings.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <AccountSettingsForm user={user} />
    </div>
  );
}
