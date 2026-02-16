"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Plus, Trash2, Copy, Key } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";

interface ProjectOption {
  id: string;
  name: string;
  slug: string;
}

interface AccountApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  usageCount: number;
  usageLimit: number | null;
  rateLimit: number;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

export function ApiSection() {
  const { getToken } = useAuth();
  const [keys, setKeys] = useState<AccountApiKey[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedProjectSlug, setSelectedProjectSlug] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const revokeTarget = useMemo(
    () => keys.find((key) => key.id === keyToRevoke) || null,
    [keys, keyToRevoke],
  );

  const fetchKeys = useCallback(async () => {
    setIsLoadingKeys(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/account/api-keys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch API keys");
      }

      const payload = await response.json();
      setKeys(Array.isArray(payload?.data?.keys) ? payload.data.keys : []);
    } catch (error) {
      toast.error("Failed to load API keys");
      console.error(error);
    } finally {
      setIsLoadingKeys(false);
    }
  }, [apiBase, getToken]);

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/projects?page=1&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const payload = await response.json();
      const projectList = Array.isArray(payload?.data) ? payload.data : [];

      const normalized: ProjectOption[] = projectList
        .filter((project: any) => project?.id && project?.slug && project?.name)
        .map((project: any) => ({
          id: project.id,
          slug: project.slug,
          name: project.name,
        }));

      setProjects(normalized);
      if (!selectedProjectSlug && normalized.length > 0) {
        setSelectedProjectSlug(normalized[0]!.slug);
      }
    } catch (error) {
      toast.error("Failed to load projects for API key creation");
      console.error(error);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [apiBase, getToken, selectedProjectSlug]);

  useEffect(() => {
    fetchProjects();
    fetchKeys();
  }, [fetchProjects, fetchKeys]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    if (!selectedProjectSlug) {
      toast.error("Please select a project");
      return;
    }

    setIsCreating(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/account/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
          projectSlug: selectedProjectSlug,
          environment: "live",
          permissions: { widgets: true, testimonials: true },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create API key");
      }

      const payload = await response.json();
      setCreatedKey(payload?.data?.key || null);
      setNewKeyName("");
      await fetchKeys();
      toast.success("API key created successfully");
    } catch (error) {
      toast.error("Failed to create API key");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/account/api-keys/${keyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to revoke API key");
      }

      await fetchKeys();
      setKeyToRevoke(null);
      toast.success("API key revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke API key");
      console.error(error);
    }
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Create and manage all API keys from this account-level page.
              Keys are stored in the database and scoped to selected projects.
            </CardDescription>
          </div>

          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) {
                setCreatedKey(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              {createdKey ? (
                <>
                  <DialogHeader>
                    <DialogTitle>API key created</DialogTitle>
                    <DialogDescription>
                      This is the only time the full key is shown. Save it now.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="rounded-md border bg-muted p-3 font-mono text-xs break-all">
                      {createdKey}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyToClipboard(createdKey)}
                      className="w-full"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy key
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => {
                        setCreatedKey(null);
                        setIsCreateOpen(false);
                      }}
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Create API key</DialogTitle>
                    <DialogDescription>
                      API keys are managed only from Account Settings.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="api-key-name">Key name</Label>
                      <Input
                        id="api-key-name"
                        placeholder="e.g., Production Widget Key"
                        value={newKeyName}
                        onChange={(event) => setNewKeyName(event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select
                        value={selectedProjectSlug}
                        onValueChange={setSelectedProjectSlug}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingProjects
                                ? "Loading projects..."
                                : "Select a project"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.slug}>
                              {project.name} ({project.slug})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateKey}
                      disabled={isCreating || !selectedProjectSlug}
                    >
                      {isCreating ? "Creating..." : "Create key"}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingKeys ? (
          <div className="text-center py-6 text-muted-foreground">
            Loading API keys...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{key.project.name}</div>
                        <div className="text-muted-foreground">/{key.project.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {key.keyPrefix}••••••••
                    </TableCell>
                    <TableCell>
                      {key.usageCount}
                      {key.usageLimit ? ` / ${key.usageLimit}` : ""}
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
                      {key.lastUsedAt
                        ? format(new Date(key.lastUsedAt), "PP")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      {key.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
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
          </div>
        )}

        {keys.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            <Key className="mx-auto mb-2 h-4 w-4" />
            No API keys found. Create one to get started.
          </div>
        )}

        <AlertDialog
          open={Boolean(keyToRevoke)}
          onOpenChange={() => setKeyToRevoke(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
              <AlertDialogDescription>
                {revokeTarget
                  ? `This will immediately disable ${revokeTarget.name} for ${revokeTarget.project.name}.`
                  : "This action cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => keyToRevoke && handleRevoke(keyToRevoke)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Revoke key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
