'use client';

import { useAuth } from '@clerk/nextjs';
import { createClientApiClient } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RequeueButton({ jobId }: { jobId: string }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequeue = async () => {
    if (!confirm('Are you sure you want to requeue this job?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const api = createClientApiClient(token);
      await api.post(`/admin/dlq/${jobId}/requeue`);
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to requeue job');
      console.error('Requeue error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleRequeue}
        disabled={loading}
        className="btn btn-primary text-xs py-1 px-3"
      >
        {loading ? 'Requeuing...' : 'Requeue'}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
