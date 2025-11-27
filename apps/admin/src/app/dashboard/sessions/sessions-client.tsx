'use client';

import { useState } from 'react';
import { useSessions, useRevokeSession, type Session, type RecentSignIn } from '@/lib/hooks/use-sessions';
import { DataTable, type DataTableColumn } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { RefreshCw, LogOut, Monitor, Clock } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils/format';
import { toast } from 'sonner';

export function SessionsClient() {
  const { data, isLoading, error, refetch } = useSessions();
  const revokeSession = useRevokeSession();
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handleRevokeClick = (session: Session) => {
    setSelectedSession(session);
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedSession) return;

    try {
      await revokeSession.mutateAsync(selectedSession.sessionId);
      toast.success('Session revoked successfully');
      setRevokeDialogOpen(false);
      setSelectedSession(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke session');
    }
  };

  const activeSessionColumns: DataTableColumn<Session>[] = [
    {
      key: 'user',
      header: 'User',
      render: (session) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {session.userName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{session.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (session) => (
        <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {session.ipAddress}
        </span>
      ),
    },
    {
      key: 'userAgent',
      header: 'Device',
      render: (session) => (
        <div className="max-w-xs">
          <span className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
            {session.userAgent}
          </span>
        </div>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (session) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {formatRelativeTime(session.lastActivity)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(session.lastActivity)}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (session) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleRevokeClick(session)}
          disabled={revokeSession.isPending}
        >
          <LogOut className="h-4 w-4" />
          Revoke
        </Button>
      ),
    },
  ];

  const recentSignInColumns: DataTableColumn<RecentSignIn>[] = [
    {
      key: 'user',
      header: 'User',
      render: (signIn) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {signIn.userName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{signIn.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (signIn) => (
        <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
          {signIn.ipAddress}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (signIn) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {formatRelativeTime(signIn.timestamp)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(signIn.timestamp)}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage active admin sessions
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Failed to Load Sessions
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button variant="destructive" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Active Sessions */}
      {data && !isLoading && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Active Sessions
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({data.activeSessions.length})
              </span>
            </div>
            <DataTable
              data={data.activeSessions}
              columns={activeSessionColumns}
              emptyMessage="No active sessions"
            />
          </div>

          {/* Recent Sign-ins */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Recent Sign-ins (Last 30 Days)
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({data.recentSignIns.length})
              </span>
            </div>
            <DataTable
              data={data.recentSignIns}
              columns={recentSignInColumns}
              emptyMessage="No recent sign-ins"
            />
          </div>
        </>
      )}

      {/* Revoke Confirmation Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader onClose={() => setRevokeDialogOpen(false)}>
            <DialogTitle>Revoke Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this session? The user will be signed out
              immediately.
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <DialogBody>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedSession.userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedSession.userEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    IP Address
                  </p>
                  <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    {selectedSession.ipAddress}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Activity
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(selectedSession.lastActivity)}
                  </p>
                </div>
              </div>
            </DialogBody>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeDialogOpen(false)}
              disabled={revokeSession.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeConfirm}
              disabled={revokeSession.isPending}
            >
              {revokeSession.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Revoke Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
