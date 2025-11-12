import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthCheckCardProps {
  name: string;
  status: boolean | null;
  description: string;
  troubleshooting?: string;
}

export function HealthCheckCard({
  name,
  status,
  description,
  troubleshooting,
}: HealthCheckCardProps) {
  const isHealthy = status === true;
  const isUnhealthy = status === false;
  const isLoading = status === null;

  return (
    <div
      className={cn(
        'rounded-lg border p-6 transition-colors',
        isHealthy && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        isUnhealthy && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        isLoading && 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {isLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          )}
          {isHealthy && (
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          )}
          {isUnhealthy && (
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          )}
        </div>

        <div className="flex-1">
          <h3
            className={cn(
              'text-lg font-semibold mb-1',
              isHealthy && 'text-green-900 dark:text-green-100',
              isUnhealthy && 'text-red-900 dark:text-red-100',
              isLoading && 'text-gray-900 dark:text-gray-100'
            )}
          >
            {name}
          </h3>
          <p
            className={cn(
              'text-sm mb-2',
              isHealthy && 'text-green-700 dark:text-green-300',
              isUnhealthy && 'text-red-700 dark:text-red-300',
              isLoading && 'text-gray-600 dark:text-gray-400'
            )}
          >
            {description}
          </p>

          {isUnhealthy && troubleshooting && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
              <p className="text-xs font-medium text-red-900 dark:text-red-100 mb-1">
                Troubleshooting:
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {troubleshooting}
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              isHealthy && 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200',
              isUnhealthy && 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200',
              isLoading && 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            )}
          >
            {isLoading ? 'Checking...' : isHealthy ? 'Healthy' : 'Unhealthy'}
          </span>
        </div>
      </div>
    </div>
  );
}
