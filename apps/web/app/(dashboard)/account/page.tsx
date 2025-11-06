"use client";

import { useUser } from "@clerk/nextjs";
import { AccountSettingsForm } from "@/components/account-settings-form";
import { LoadingStars } from "@/components/loader";

export default function AccountPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-4 w-full h-screen items-center justify-center">
        <LoadingStars />
        <p className="text-sm text-muted-foreground">Loading account settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-muted-foreground">Please sign in to view account settings.</p>
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
