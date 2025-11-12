import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { formatDate } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface EmailHistoryProps {
  history: Array<{
    id: string;
    date: string;
    count: number;
    createdAt: string;
  }>;
}

export function EmailHistory({ history }: EmailHistoryProps) {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const total = history.reduce((sum, day) => sum + day.count, 0);
  const average = history.length > 0 ? Math.round(total / history.length) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Email History (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No email history available</p>
          ) : (
            <>
              {sortedHistory.map((day) => (
                <div key={day.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(day.count / 200) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {day.count}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Average</span>
                  <span className="text-muted-foreground">{average}/day</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
