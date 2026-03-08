'use client';

import { useEffect } from 'react';
import { reportClientError } from '@/lib/errors/report-client-error';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      source: 'react-boundary',
      message: error.message,
      name: error.name,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
