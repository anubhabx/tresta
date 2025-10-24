"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { PlusIcon, FolderIcon } from "lucide-react";

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Link href="/projects/new" className="block">
            <Button
              variant="outline"
              className="w-full justify-start"
              size="lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Project
            </Button>
          </Link>
          <Link href="/projects" className="block">
            <Button
              variant="outline"
              className="w-full justify-start"
              size="lg"
            >
              <FolderIcon className="h-5 w-5 mr-2" />
              View All Projects
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
