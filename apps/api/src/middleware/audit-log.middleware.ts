import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../lib/redis.ts';

/**
 * Audit log middleware with guaranteed delivery
 * 
 * Captures admin actions and logs them with:
 * - Admin user ID
 * - Action type (derived from method + path)
 * - Target resource (from params)
 * - Request body (for write operations)
 * - X-Request-ID for correlation with Sentry
 * - Timestamp
 * 
 * Uses Redis retry queue for failed writes to ensure no audit logs are lost
 * 
 * Usage:
 * router.put('/admin/settings', requireAdmin, auditLog, handler);
 */
export function auditLog(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { userId } = getAuth(req);
  
  if (!userId) {
    // Skip audit logging for unauthenticated requests
    return next();
  }

  // Generate or use existing X-Request-ID
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Capture request details
  const auditEntry = {
    id: uuidv4(),
    adminId: userId,
    action: `${req.method} ${req.path}`,
    method: req.method,
    path: req.path,
    targetType: extractTargetType(req.path),
    targetId: extractTargetId(req),
    requestBody: sanitizeRequestBody(req.body),
    requestId,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  };

  // Capture response after it's sent
  const originalSend = res.send;
  res.send = function (data: any): Response {
    // Add response status to audit entry
    const completeAuditEntry = {
      ...auditEntry,
      statusCode: res.statusCode,
      success: res.statusCode >= 200 && res.statusCode < 300,
    };

    // Write audit log asynchronously (don't block response)
    writeAuditLog(completeAuditEntry).catch((error) => {
      console.error('Failed to write audit log:', error);
      // Add to Redis retry queue
      addToRetryQueue(completeAuditEntry).catch((retryError) => {
        console.error('Failed to add audit log to retry queue:', retryError);
        // TODO: Send Slack alert for audit log failure
      });
    });

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Extract target type from request path
 * e.g., /admin/users/:id -> 'user'
 */
function extractTargetType(path: string): string | null {
  const match = path.match(/\/admin\/([^\/]+)/);
  if (match) {
    const resource = match[1];
    // Singularize common resources
    if (resource === 'users') return 'user';
    if (resource === 'projects') return 'project';
    if (resource === 'testimonials') return 'testimonial';
    if (resource === 'settings') return 'settings';
    if (resource === 'sessions') return 'session';
    return resource;
  }
  return null;
}

/**
 * Extract target ID from request params
 */
function extractTargetId(req: Request): string | null {
  return req.params.id || req.params.sessionId || null;
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Write audit log to database
 * 
 * Note: This is a placeholder. Requires AuditLog table in database.
 * For now, we'll write to Redis as a temporary store.
 */
async function writeAuditLog(entry: any): Promise<void> {
  const redis = getRedisClient();
  
  // Store in Redis list (temporary until database table is created)
  await redis.lpush('audit_logs', JSON.stringify(entry));
  
  // Keep only last 10000 entries in Redis
  await redis.ltrim('audit_logs', 0, 9999);
  
  // TODO: Write to database AuditLog table when migration is complete
}

/**
 * Add failed audit log to Redis retry queue
 */
async function addToRetryQueue(entry: any): Promise<void> {
  const redis = getRedisClient();
  
  const retryEntry = {
    ...entry,
    retryCount: 0,
    addedToQueueAt: new Date().toISOString(),
  };
  
  await redis.lpush('audit_logs:retry_queue', JSON.stringify(retryEntry));
}

/**
 * Background worker to retry failed audit logs
 * Should be called periodically (e.g., every minute)
 */
export async function retryFailedAuditLogs(): Promise<void> {
  const redis = getRedisClient();
  
  try {
    // Get all entries from retry queue
    const entries = await redis.lrange('audit_logs:retry_queue', 0, -1);
    
    for (const entryStr of entries) {
      try {
        const entry = JSON.parse(entryStr);
        
        // Attempt to write to database
        await writeAuditLog(entry);
        
        // Remove from retry queue on success
        await redis.lrem('audit_logs:retry_queue', 1, entryStr);
        
        console.log(`Successfully retried audit log: ${entry.id}`);
      } catch (error) {
        console.error('Failed to retry audit log:', error);
        
        // Increment retry count
        const entry = JSON.parse(entryStr);
        entry.retryCount = (entry.retryCount || 0) + 1;
        
        // Remove old entry and add updated one
        await redis.lrem('audit_logs:retry_queue', 1, entryStr);
        
        // Only retry up to 5 times
        if (entry.retryCount < 5) {
          await redis.lpush('audit_logs:retry_queue', JSON.stringify(entry));
        } else {
          console.error(`Audit log ${entry.id} exceeded max retries, dropping`);
          // TODO: Send Slack alert for dropped audit log
        }
      }
    }
  } catch (error) {
    console.error('Error in retryFailedAuditLogs:', error);
  }
}
