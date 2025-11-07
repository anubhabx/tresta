"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { FolderIcon, MessageSquareIcon, TrendingUpIcon } from "lucide-react";

interface DashboardStatsProps {
  totalProjects: number;
  activeProjects: number;
  totalTestimonials: number;
}

export function DashboardStats({
  totalProjects,
  activeProjects,
  totalTestimonials,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <FolderIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {activeProjects} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Testimonials
          </CardTitle>
          <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTestimonials}</div>
          <p className="text-xs text-muted-foreground">Across all projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average per Project
          </CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalProjects > 0
              ? Math.round(totalTestimonials / totalProjects)
              : 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Testimonials per project
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
