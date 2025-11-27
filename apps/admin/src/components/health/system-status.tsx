import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatusProps {
  status: 'ready' | 'not ready' | 'loading';
  checks: {
    database: boolean;
    redis: boolean;
    bullmq: boolean;
  };
}

export function SystemStatus({ status, checks }: SystemStatusProps) {
  const isReady = status === 'ready';
  const isNotReady = status === 'not ready';
  const isLoading = status === 'loading';

  const allHealthy = checks.database && checks.redis && checks.bullmq;
  const someUnhealthy = !allHealthy && (checks.database || checks.redis || checks.bullmq);
  const allUnhealthy = !checks.database && !checks.redis && !checks.bullmq;

  const iconClassName = cn(
    'h-16 w-16',
    allHealthy && 'text-green-600 dark:text-green-400',
    someUnhealthy && 'text-yellow-600 dark:text-yellow-400',
    allUnhealthy && 'text-red-600 dark:text-red-400'
  );

  const iconElement = (() => {
    if (isLoading) return null;
    if (allHealthy) return <CheckCircle className={iconClassName} />;
    if (allUnhealthy) return <XCircle className={iconClassName} />;
    return <AlertTriangle className={iconClassName} />;
  })();

  return (
    <div
      className={cn(
        'rounded-lg border p-8 text-center',
        isReady && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        isNotReady && someUnhealthy && 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        isNotReady && allUnhealthy && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        isLoading && 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      )}
    >
      {iconElement && <div className="flex justify-center mb-4">{iconElement}</div>}

      <h2
        className={cn(
          'text-2xl font-bold mb-2',
          isReady && 'text-green-900 dark:text-green-100',
          isNotReady && someUnhealthy && 'text-yellow-900 dark:text-yellow-100',
          isNotReady && allUnhealthy && 'text-red-900 dark:text-red-100',
          isLoading && 'text-gray-900 dark:text-gray-100'
        )}
      >
        {isLoading
          ? 'Checking System Status...'
          : allHealthy
          ? 'All Systems Operational'
          : allUnhealthy
          ? 'All Systems Down'
          : 'Some Systems Degraded'}
      </h2>

      <p
        className={cn(
          'text-sm',
          isReady && 'text-green-700 dark:text-green-300',
          isNotReady && someUnhealthy && 'text-yellow-700 dark:text-yellow-300',
          isNotReady && allUnhealthy && 'text-red-700 dark:text-red-300',
          isLoading && 'text-gray-600 dark:text-gray-400'
        )}
      >
        {isLoading
          ? 'Please wait while we check the system health...'
          : allHealthy
          ? 'All infrastructure components are functioning normally.'
          : allUnhealthy
          ? 'Critical infrastructure failure detected. Immediate attention required.'
          : 'Some infrastructure components are experiencing issues.'}
      </p>
    </div>
  );
}
