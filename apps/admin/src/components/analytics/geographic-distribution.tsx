'use client';

import { Globe } from 'lucide-react';

interface CountryData {
  name: string;
  count: number;
  percentage: number;
}

interface GeographicDistributionProps {
  data: CountryData[];
}

export function GeographicDistribution({ data }: GeographicDistributionProps) {
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-foreground">
          Geographic Distribution
        </h2>
      </div>
      {sortedData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No geographic data available
        </div>
      ) : (
        <div className="space-y-3">
          {sortedData.map((country, index) => (
            <div key={country.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-foreground">
                    {country.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {country.count.toLocaleString()} loads
                  </span>
                  <span className="text-muted-foreground w-12 text-right">
                    {country.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${country.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
