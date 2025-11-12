import { cn } from '@/lib/utils';
import { formatPercentage } from '@/lib/utils/format';

interface QuotaIndicatorProps {
  title: string;
  used: number;
  limit: number;
  percentage: number;
  remaining: number;
  locked?: boolean;
}

export function QuotaIndicator({
  title,
  used,
  limit,
  percentage,
  remaining,
  locked,
}: QuotaIndicatorProps) {
  // Determine color based on percentage
  const getColor = () => {
    if (locked || percentage >= 90) return 'red';
    if (percentage >= 80) return 'yellow';
    return 'green';
  };

  const color = getColor();

  const colorClasses = {
    green: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      bar: 'bg-green-600 dark:bg-green-400',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      bar: 'bg-yellow-600 dark:bg-yellow-400',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      bar: 'bg-red-600 dark:bg-red-400',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={cn(
        'rounded-lg border p-6',
        classes.bg,
        classes.border
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {locked && (
          <span className="text-xs font-medium px-2 py-1 rounded bg-red-600 text-white">
            LOCKED
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            {used} / {limit}
          </span>
          <span className={cn('font-bold', classes.text)}>
            {formatPercentage(percentage)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={cn('h-2.5 rounded-full transition-all', classes.bar)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {remaining} remaining
        </p>
      </div>
    </div>
  );
}
