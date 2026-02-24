'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface EmailHistoryData {
  date: string;
  sent: number;
  deferred: number;
  failed: number;
}

interface EmailHistoryChartProps {
  data: EmailHistoryData[];
}

export function EmailHistoryChart({ data }: EmailHistoryChartProps) {
  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        7-Day Email History
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            className="text-xs text-muted-foreground"
          />
          <YAxis className="text-xs text-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sent"
            stroke="var(--chart-2)"
            strokeWidth={2}
            name="Sent"
          />
          <Line
            type="monotone"
            dataKey="deferred"
            stroke="var(--chart-3)"
            strokeWidth={2}
            name="Deferred"
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="var(--chart-5)"
            strokeWidth={2}
            name="Failed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
