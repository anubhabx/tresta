"use client";

import { useUser } from "@clerk/nextjs";
import { AccountSettingsSkeleton } from "@/components/skeletons/account-skeleton";
import { AccountSettingsLayout } from "@/components/account-settings/account-settings-layout";
import {
  DataPrivacySection,
  BillingSection,
} from "@/components/account-settings";
import { GeneralSettingsSection } from "@/components/account-settings/general-settings-section";
import { ApiSection } from "@/components/account-settings/api-section";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

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

  const hasPassword = user.passwordEnabled;
  const externalAccounts = user.externalAccounts || [];

  const handleAccountDeleted = () => {
    router.push("/");
  };

  return (
    <AccountSettingsLayout
      profileContent={
        <GeneralSettingsSection
          user={user}
          hasPassword={hasPassword}
          externalAccounts={externalAccounts}
        />
      }
      billingContent={<BillingSection />}
      apiContent={<ApiSection />}
      dangerContent={
        <DataPrivacySection onAccountDeleted={handleAccountDeleted} />
      }
    />
  );
}
