'use client';

import { useEffect } from 'react';
import { reportClientError, reportErrorFromUnknown } from '@/lib/errors/report-client-error';

export function ErrorTrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      reportClientError({
        source: 'window-error',
        message: event.message || 'Unhandled window error',
        name: event.error instanceof Error ? event.error.name : 'WindowError',
        stack: event.error instanceof Error ? event.error.stack : undefined,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportErrorFromUnknown('unhandled-rejection', event.reason, {
        reasonType: typeof event.reason,
      });
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}