/**
 * Moderation Statistics Widget
 * Displays overview of moderation queue status
 */

import { Card } from "@workspace/ui/components/card";
import { AlertCircle, CheckCircle, Flag, XCircle } from "lucide-react";
import type { ModerationStats } from "@/types/api";

interface ModerationStatsWidgetProps {
  stats: ModerationStats;
}

export function ModerationStatsWidget({ stats }: ModerationStatsWidgetProps) {
  const statCards = [
    {
      label: "Pending Review",
      value: stats.pending,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Flagged",
      value: stats.flagged,
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
