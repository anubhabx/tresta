import type { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../../lib/response.ts';
import { clerkClient } from '@clerk/express';
import { InternalServerError } from '../../lib/errors.ts';

/**
 * GET /admin/sessions
 * Get list of active admin sessions
 */
export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all sessions from Clerk
    const sessions = await clerkClient.sessions.getSessionList({
      status: 'active',
      limit: 100,
    });

    // Get user details for each session to filter admins
    const sessionDetails = await Promise.all(
      sessions.data.map(async (session) => {
        try {
          const user = await clerkClient.users.getUser(session.userId);

          // Check if user has admin role
          const isAdmin = user.publicMetadata?.role === 'admin' ||
            user.privateMetadata?.role === 'admin';

          if (!isAdmin) return null;

          return {
            id: session.id,
            userId: session.userId,
            userEmail: user.emailAddresses[0]?.emailAddress || 'N/A',
            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
            status: session.status,
            lastActiveAt: session.lastActiveAt,
            expireAt: session.expireAt,
            createdAt: session.createdAt,
          };
        } catch (error) {
          console.error(`Failed to fetch user for session ${session.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null values (non-admin sessions)
    const activeSessions = sessionDetails.filter(Boolean);

    // Get recent sign-ins (last 30 days) - this would require custom tracking
    // For now, we'll return active sessions as recent sign-ins
    const recentSignIns = activeSessions.slice(0, 10);

    return ResponseHandler.success(res, {
      data: {
        activeSessions,
        recentSignIns,
        total: activeSessions.length,
      },
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    next(new InternalServerError('Failed to fetch sessions from Clerk API'));
  }
};

/**
 * POST /admin/sessions/:sessionId/revoke
 * Revoke an admin session
 */
export const revokeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const adminId = (req as any).auth?.userId;

    if (!sessionId) {
      return ResponseHandler.error(res, 400, 'Session ID is required');
    }

    // Revoke the session via Clerk API
    await clerkClient.sessions.revokeSession(sessionId);

    // TODO: Log revocation in audit log
    // This would require the audit log service to be implemented
    // For now, we'll just log to console
    console.log(`Session ${sessionId} revoked by admin ${adminId}`);

    return ResponseHandler.success(res, {
      data: {
        success: true,
        message: 'Session revoked successfully',
        sessionId,
      },
    });
  } catch (error) {
    console.error('Failed to revoke session:', error);
    next(new InternalServerError('Failed to revoke session via Clerk API'));
  }
};
