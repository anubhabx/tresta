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

interface ChartData {
  date: string;
  total: number;
  successful: number;
  failed: number;
}

interface WidgetAnalyticsChartProps {
  data: ChartData[];
}

export function WidgetAnalyticsChart({ data }: WidgetAnalyticsChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Widget Load Trends
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--popover-foreground)',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--chart-1)"
            strokeWidth={2}
            name="Total Loads"
            dot={{ fill: 'var(--chart-1)' }}
          />
          <Line
            type="monotone"
            dataKey="successful"
            stroke="var(--chart-2)"
            strokeWidth={2}
            name="Successful"
            dot={{ fill: 'var(--chart-2)' }}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="var(--chart-5)"
            strokeWidth={2}
            name="Failed"
            dot={{ fill: 'var(--chart-5)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
