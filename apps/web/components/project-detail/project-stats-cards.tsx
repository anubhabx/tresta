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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Total Testimonials
          </CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <MessageSquareIcon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight">
            {project._count?.testimonials || 0}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Testimonials collected
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Active Widgets
          </CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <LayoutGridIcon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight">
            {project._count?.widgets || 0}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Display widgets
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            Status
          </CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <SettingsIcon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 sm:space-y-2">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight">
            {project.isActive ? "Active" : "Inactive"}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Project status
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
