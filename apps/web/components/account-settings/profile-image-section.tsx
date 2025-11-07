"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { CustomAvatar } from "@workspace/ui/components/avatar";
import { toast } from "sonner";
import { InlineLoader } from "../loader";
import { UserCircleIcon, CameraIcon } from "lucide-react";

interface ProfileImageSectionProps {
  user: any;
  onImageUpdate?: () => void;
}

export function ProfileImageSection({
  user,
  onImageUpdate,
}: ProfileImageSectionProps) {
  const [imageLoading, setImageLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setImageLoading(true);
      await user.setProfileImage({ file });
      toast.success("Profile image updated successfully!");
      onImageUpdate?.();
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error?.errors?.[0]?.message || "Failed to upload image");
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setImageLoading(true);
      await user.setProfileImage({ file: null });
      toast.success("Profile image removed successfully!");
      onImageUpdate?.();
    } catch (error: any) {
      console.error("Image removal error:", error);
      toast.error(error?.errors?.[0]?.message || "Failed to remove image");
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircleIcon className="h-5 w-5" />
          Profile Image
        </CardTitle>
        <CardDescription>Update your profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative">
            <CustomAvatar
              src={user.imageUrl}
              name={user.firstName || user.username || "User"}
              alt={user.firstName || "User"}
              className="h-24 w-24"
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                <InlineLoader />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={imageLoading}
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                <CameraIcon className="h-4 w-4 mr-2" />
                Change Image
              </Button>
              {user.imageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={imageLoading}
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max size 5MB.
            </p>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={imageLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
