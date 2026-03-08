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
      source: 'global-boundary',
      message: error.message,
      name: error.name,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
        <div className="flex min-h-[400px] max-w-lg flex-col items-center justify-center gap-4 text-center">
          <div>
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected application error occurred. Please try again.
            </p>
          </div>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}