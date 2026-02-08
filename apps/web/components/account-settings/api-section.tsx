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
import { Plus } from "lucide-react";
import { ApiKeyCard } from "./api-key-card";

// Mock Data for UI dev - replace with actual data fetching
// In a real app we'd use useQuery here
const MOCK_KEYS = [
  {
    id: "1",
    name: "Production Key",
    keyPrefix: "pk_live_8a92",
    lastUsedAt: "2 mins ago",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Development Key",
    keyPrefix: "pk_test_b712",
    lastUsedAt: "1 day ago",
    createdAt: "2024-02-15",
  },
];

export function ApiSection() {
  const [keys, setKeys] = useState(MOCK_KEYS);

  const handleRegenerate = async (id: string) => {
    // Implement API call
    console.log("Regenerating", id);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleDelete = async (id: string) => {
    // Implement API call
    console.log("Deleting", id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCreate = () => {
    console.log("Create new key");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys for accessing the Tresta platform
              programmatically.
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Key
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {keys.map((key) => (
          <ApiKeyCard
            key={key.id}
            apiKey={key}
            onRegenerate={handleRegenerate}
            onDelete={handleDelete}
          />
        ))}
        {keys.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            No API keys found. Create one to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
