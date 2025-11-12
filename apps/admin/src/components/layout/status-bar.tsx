'use client';

import { CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHealth } from '@/lib/hooks/use-health';

type SystemStatus = 'operational' | 'degraded' | 'down' | 'loading';

export function StatusBar() {
  const { data: health, isLoading } = useHealth(30000); // Refresh every 30 seconds

  const getStatus = (): SystemStatus => {
    if (isLoading || !health) return 'loading';
    
    const { database, redis, bullmq } = health.checks;
    const allHealthy = database && redis && bullmq;
    const allUnhealthy = !database && !redis && !bullmq;
    
    if (allHealthy) return 'operational';
    if (allUnhealthy) return 'down';
    return 'degraded';
  };

  const status = getStatus();

  const statusConfig = {
    operational: {
      icon: CheckCircle,
      text: 'All Systems Operational',
      className: 'text-green-600 dark:text-green-400',
      bgClassName: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    },
    degraded: {
      icon: AlertCircle,
      text: 'Some Systems Degraded',
      className: 'text-yellow-600 dark:text-yellow-400',
      bgClassName: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    },
    down: {
      icon: XCircle,
      text: 'System Issues Detected',
      className: 'text-red-600 dark:text-red-400',
      bgClassName: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    },
    loading: {
      icon: Loader2,
      text: 'Checking Status...',
      className: 'text-gray-600 dark:text-gray-400',
      bgClassName: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium',
        config.bgClassName,
        config.className
      )}
    >
      <Icon className={cn('h-4 w-4', status === 'loading' && 'animate-spin')} />
      <span>{config.text}</span>
    </div>
  );
}
