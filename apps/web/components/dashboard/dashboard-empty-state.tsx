"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import { PlusIcon, SparklesIcon } from "lucide-react";

export function DashboardEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <SparklesIcon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Welcome to Tresta!</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Get started by creating your first project. Collect, manage, and
          showcase testimonials from your customers.
        </p>
        <Link href="/projects/new">
          <Button size="lg">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Project
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
