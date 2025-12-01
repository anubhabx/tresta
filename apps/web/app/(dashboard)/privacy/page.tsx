import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DataCollectionInfo from "@/components/account-settings/data-collection-info";

export const metadata = {
  title: "Privacy & Data Collection | Tresta",
  description: "Learn about what data we collect and how we use it",
};

export default async function PrivacyPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Privacy & Data Collection
        </h1>
        <p className="text-muted-foreground">
          We believe in transparency. Here&apos;s exactly what data we collect and
          why.
        </p>
      </div>

      <DataCollectionInfo />
    </div>
  );
}
