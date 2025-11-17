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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Geographic Distribution
        </h2>
      </div>
      {sortedData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No geographic data available
        </div>
      ) : (
        <div className="space-y-3">
          {sortedData.map((country, index) => (
            <div key={country.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {country.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 dark:text-gray-400">
                    {country.count.toLocaleString()} loads
                  </span>
                  <span className="text-gray-500 dark:text-gray-500 w-12 text-right">
                    {country.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
