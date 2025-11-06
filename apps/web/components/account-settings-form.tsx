"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { CustomAvatar } from "@workspace/ui/components/avatar";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@workspace/ui/components/alert-dialog";
import { InlineLoader } from "./loader";
import {
  UserIcon,
  MailIcon,
  KeyIcon,
  UserCircleIcon,
  CameraIcon,
  ShieldCheckIcon,
  LinkIcon,
  CheckCircle2Icon,
  DownloadIcon,
  TrashIcon,
  DatabaseIcon,
  ShieldAlertIcon
} from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Badge } from "@workspace/ui/components/badge";

interface AccountSettingsFormProps {
  user: NonNullable<ReturnType<typeof useUser>["user"]>;
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const { user: currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check if user has password authentication (not OAuth-only)
  const hasPassword = user.passwordEnabled;

  // Get external accounts (OAuth connections)
  const externalAccounts = user.externalAccounts || [];
  const hasGoogleAccount = externalAccounts.some(
    (account) => account.provider === "google"
  );
  const hasGithubAccount = externalAccounts.some(
    (account) => account.provider === "github"
  );

  // Profile Information State
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    try {
      setLoading(true);

      await currentUser.update({
        firstName: firstName || undefined,
        lastName: lastName || undefined
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error?.errors?.[0]?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await currentUser.updatePassword({
        currentPassword,
        newPassword
      });

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password update error:", error);
      toast.error(error?.errors?.[0]?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }

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
      await currentUser.setProfileImage({ file });
      toast.success("Profile image updated successfully!");
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error?.errors?.[0]?.message || "Failed to upload image");
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    try {
      setImageLoading(true);
      await currentUser.setProfileImage({ file: null });
      toast.success("Profile image removed successfully!");
    } catch (error: any) {
      console.error("Image removal error:", error);
      toast.error(error?.errors?.[0]?.message || "Failed to remove image");
    } finally {
      setImageLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    try {
      setExportLoading(true);
      
      // Collect user data
      const userData = {
        account: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        emailAddresses: user.emailAddresses.map(email => ({
          email: email.emailAddress,
          verified: email.verification?.status === "verified",
        })),
        externalAccounts: user.externalAccounts.map(account => ({
          provider: account.provider,
          email: account.emailAddress,
          username: account.username,
        })),
        exportedAt: new Date().toISOString(),
      };

      // Create downloadable JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tresta-account-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Account data exported successfully!");
    } catch (error: any) {
      console.error("Export data error:", error);
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    try {
      setDeleteLoading(true);
      
      // Note: Clerk's delete method will sign out the user and delete their account
      await currentUser.delete();
      
      toast.success("Account deleted successfully. Redirecting...");
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error(error?.errors?.[0]?.message || "Failed to delete account");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Image Section */}
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
                name={user.firstName || "User"}
                size="lg"
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

      {/* Profile Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  type="email"
                  value={user.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="opacity-60"
                />
                <MailIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed at this time
              </p>
            </div>

            <Separator />

            <div className="flex justify-end">
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
        </CardContent>
      </Card>

      {/* Password Section */}
      {hasPassword ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <InlineLoader />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              Password Authentication
            </CardTitle>
            <CardDescription>
              You signed in with a social account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  OAuth Authentication Active
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your account uses social sign-in (Google/GitHub) for
                  authentication. Password management is not available for
                  OAuth-only accounts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage your connected social accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
                <CheckCircle2Icon className="h-3 w-3 text-green-500" />
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
                <FaGithub className="h-5 w-5 text-primary" />
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
                <CheckCircle2Icon className="h-3 w-3 text-green-500" />
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
        </CardContent>
      </Card>

      {/* Account Information (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Account ID</span>
            <span className="text-sm text-muted-foreground font-mono">
              {user.id}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Account Created</span>
            <span className="text-sm text-muted-foreground">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Last Updated</span>
            <span className="text-sm text-muted-foreground">
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Export Data Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <DownloadIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Export Your Data</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Download a copy of your account information, including profile
                  details and connected accounts.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <>
                    <InlineLoader />
                    Exporting...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export Data (JSON)
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Data Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">What data do we store?</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2Icon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Account information (name, email, profile picture)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2Icon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Projects you create and manage</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2Icon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Testimonials submitted to your projects</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2Icon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Widget configurations and settings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2Icon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Usage analytics (anonymized)</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Delete Account Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <ShieldAlertIcon className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Delete Account
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This
                  action cannot be undone and will remove:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <TrashIcon className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>All your projects and testimonials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrashIcon className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>All widget configurations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrashIcon className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Your profile and account information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrashIcon className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>All connected social accounts</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleteLoading}>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogPortal>
                  <AlertDialogOverlay />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600 dark:text-red-400">
                        Delete Account Permanently?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          This action is <strong>irreversible</strong>. All your
                          data will be permanently deleted, including:
                        </p>
                        <ul className="space-y-1 text-sm">
                          <li>• All projects and testimonials</li>
                          <li>• All widget configurations</li>
                          <li>• Your profile and account information</li>
                          <li>• All connected social accounts</li>
                        </ul>
                        <p className="text-sm font-medium pt-2">
                          Are you absolutely sure you want to continue?
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleteLoading}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          variant="destructive"
                          className="text-white"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteAccount();
                          }}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? (
                            <>
                              <InlineLoader />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Yes, Delete My Account
                            </>
                          )}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogPortal>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
