"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { MessageSquareIcon, LayoutGridIcon, SettingsIcon } from "lucide-react";
import type { Project } from "@/types/api";

interface ProjectStatsCardsProps {
  project: Project;
}

export function ProjectStatsCards({ project }: ProjectStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Testimonials
          </CardTitle>
          <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {project._count?.testimonials || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Testimonials collected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Widgets</CardTitle>
          <LayoutGridIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {project._count?.widgets || 0}
          </div>
          <p className="text-xs text-muted-foreground">Display widgets</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <SettingsIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {project.isActive ? "Active" : "Inactive"}
          </div>
          <p className="text-xs text-muted-foreground">Project status</p>
        </CardContent>
      </Card>
    </div>
  );
}
