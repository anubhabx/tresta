"use client";

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import { InlineLoader } from "../loader";
import { UserIcon, MailIcon } from "lucide-react";

interface ProfileInformationSectionProps {
  user: any;
  onUpdate?: () => void;
}

export function ProfileInformationSection({
  user,
  onUpdate,
}: ProfileInformationSectionProps) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await user.update({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      toast.success("Profile updated successfully!");
      onUpdate?.();
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error?.errors?.[0]?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Profile Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="flex items-center gap-2 relative">
            <Input
              id="email"
              type="email"
              value={user.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="opacity-60"
            />
            <MailIcon className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xs text-muted-foreground">
            Email cannot be changed at this time
          </p>
        </div>

        <div className="flex justify-start">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <InlineLoader />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
