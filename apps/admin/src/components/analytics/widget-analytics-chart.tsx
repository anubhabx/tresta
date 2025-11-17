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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Widget Load Trends
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Total Loads"
            dot={{ fill: '#3B82F6' }}
          />
          <Line
            type="monotone"
            dataKey="successful"
            stroke="#10B981"
            strokeWidth={2}
            name="Successful"
            dot={{ fill: '#10B981' }}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="#EF4444"
            strokeWidth={2}
            name="Failed"
            dot={{ fill: '#EF4444' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
