"use client";

import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { LinkIcon, CheckCircle2Icon } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";

interface ConnectedAccountsSectionProps {
  externalAccounts: any[];
}

export function ConnectedAccountsSection({
  externalAccounts,
}: ConnectedAccountsSectionProps) {
  const hasGoogleAccount = externalAccounts.some(
    (account) => account.provider === "google",
  );
  const hasGithubAccount = externalAccounts.some(
    (account) => account.provider === "github",
  );

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Connected Accounts
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your connected social accounts
        </p>
      </div>

      <div className="space-y-3">
        {/* Google Account */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FaGoogle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Google</p>
              <p className="text-xs text-muted-foreground">
                {hasGoogleAccount
                  ? externalAccounts.find((a) => a.provider === "google")
                      ?.emailAddress || "Connected"
                  : "Not connected"}
              </p>
            </div>
          </div>
          {hasGoogleAccount ? (
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle2Icon className="h-3 w-3 text-success" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">Not Connected</Badge>
          )}
        </div>

        {/* GitHub Account */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FaGithub className="h-5 w-5 text-primary " />
            </div>
            <div>
              <p className="text-sm font-medium">GitHub</p>
              <p className="text-xs text-muted-foreground">
                {hasGithubAccount
                  ? externalAccounts.find((a) => a.provider === "github")
                      ?.username || "Connected"
                  : "Not connected"}
              </p>
            </div>
          </div>
          {hasGithubAccount ? (
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle2Icon className="h-3 w-3 text-success" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">Not Connected</Badge>
          )}
        </div>

        {externalAccounts.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No social accounts connected
          </div>
        )}
      </div>
    </section>
  );
}
