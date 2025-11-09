"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Copy, Key, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Project } from "@/types/api";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: Record<string, boolean>;
  usageCount: number;
  usageLimit: number | null;
  rateLimit: number;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface ProjectApiKeysTabProps {
  project: Project;
}

export function ProjectApiKeysTab({ project }: ProjectApiKeysTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

  // Fetch API keys
  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project.slug}/api-keys`, {
        headers: {
          Authorization: `Bearer ${await (window as any).Clerk.session.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch API keys");
      }

      const data = await response.json();
      setApiKeys(data.data || []);
    } catch (error) {
      toast.error("Failed to load API keys");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create API key
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project.slug}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await (window as any).Clerk.session.getToken()}`,
        },
        body: JSON.stringify({
          name: newKeyName,
          environment: "live",
          permissions: { widgets: true },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create API key");
      }

      const data = await response.json();
      setCreatedKey(data.data.key);
      setNewKeyName("");
      await fetchApiKeys();
      toast.success("API key created successfully!");
    } catch (error) {
      toast.error("Failed to create API key");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  // Revoke API key
  const handleRevokeKey = async (keyId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project.slug}/api-keys/${keyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await (window as any).Clerk.session.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to revoke API key");
      }

      await fetchApiKeys();
      toast.success("API key revoked successfully");
      setKeyToRevoke(null);
    } catch (error) {
      toast.error("Failed to revoke API key");
      console.error(error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Load keys on mount
  useState(() => {
    fetchApiKeys();
  });

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                API Keys
              </CardTitle>
              <CardDescription className="mt-2 text-xs sm:text-sm">
                Manage API keys for accessing your project's widgets. Each key is scoped to this project.
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="touch-manipulation min-h-[44px] sm:min-h-0 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                {createdKey ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        API Key Created
                      </DialogTitle>
                      <DialogDescription>
                        This is the only time you'll see this key. Please copy it and store it securely.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono break-all">{createdKey}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(createdKey)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>
                          Make sure to copy your API key now. You won't be able to see it again!
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          setCreatedKey(null);
                          setIsCreateDialogOpen(false);
                        }}
                      >
                        Done
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Give your API key a descriptive name to help you identify it later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="keyName">Key Name</Label>
                        <Input
                          id="keyName"
                          placeholder="e.g., Production Widget Key"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateKey} disabled={isCreating}>
                        {isCreating ? "Creating..." : "Create Key"}
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading API keys...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys yet. Create one to start embedding widgets.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="text-sm">{key.keyPrefix}••••••••</code>
                    </TableCell>
                    <TableCell>
                      {key.usageCount} {key.usageLimit ? `/ ${key.usageLimit}` : ""}
                    </TableCell>
                    <TableCell>{key.rateLimit}/hour</TableCell>
                    <TableCell>
                      {key.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.lastUsedAt ? format(new Date(key.lastUsedAt), "PP") : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      {key.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setKeyToRevoke(key.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revoke confirmation dialog */}
      <AlertDialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Applications using this key will no longer be able to access your widgets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToRevoke && handleRevokeKey(keyToRevoke)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
