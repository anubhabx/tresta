# Admin Authentication Setup Guide

## Overview

The admin authentication system uses Clerk's `publicMetadata` to store user roles. This allows centralized role management through the Clerk Dashboard without requiring database changes.

## Backend Implementation ✅

The following has been implemented:

1. **Admin Middleware** (`apps/api/src/middleware/admin.middleware.ts`)
   - `requireAdmin` - Blocks non-admin users
   - `requireRole` - Flexible role-based access control
   - `checkAdmin` - Non-blocking admin check

2. **Protected Routes** (`apps/api/src/routes/admin/index.ts`)
   - `/admin/metrics` - System metrics
   - `/admin/dlq` - Dead letter queue management
   - `/admin/dlq/:id/requeue` - Requeue failed jobs
   - `/admin/dlq/stats` - DLQ statistics

3. **Error Handling**
   - `401 Unauthorized` - User not authenticated
   - `403 Forbidden` - User authenticated but not admin

## Setting Up Admin Users

### Method 1: Clerk Dashboard (Recommended)

1. **Log in to Clerk Dashboard**
   - Go to https://dashboard.clerk.com
   - Select your application

2. **Navigate to Users**
   - Click "Users" in the left sidebar
   - Find the user you want to make admin

3. **Edit User Metadata**
   - Click on the user
   - Go to the "Metadata" tab
   - Click "Edit" next to "Public metadata"

4. **Add Admin Role**
   ```json
   {
     "role": "admin"
   }
   ```

5. **Save Changes**
   - Click "Save"
   - The user now has admin access

### Method 2: Clerk API (Programmatic)

```typescript
import { clerkClient } from '@clerk/express';

// Make a user admin
await clerkClient.users.updateUser('user_id_here', {
  publicMetadata: {
    role: 'admin'
  }
});

// Remove admin role
await clerkClient.users.updateUser('user_id_here', {
  publicMetadata: {
    role: 'user'
  }
});
```

### Method 3: Clerk Backend API (cURL)

```bash
curl -X PATCH https://api.clerk.com/v1/users/{user_id} \
  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "public_metadata": {
      "role": "admin"
    }
  }'
```

## Testing Admin Access

### 1. Test Without Admin Role

```bash
# Should return 403 Forbidden
curl -X GET http://localhost:8000/admin/metrics \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Admin access required",
  "statusCode": 403
}
```

### 2. Test With Admin Role

```bash
# Should return metrics data
curl -X GET http://localhost:8000/admin/metrics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "emailQuota": { ... },
    "ablyConnections": 12,
    "metrics": { ... }
  }
}
```

### 3. Test Without Authentication

```bash
# Should return 401 Unauthorized
curl -X GET http://localhost:8000/admin/metrics
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Authentication required",
  "statusCode": 401
}
```

## Usage Examples

### Protecting a Route

```typescript
import { requireAdmin } from '../middleware/admin.middleware.ts';

// Single route
router.get('/admin/users', requireAdmin, getUsersHandler);

// Multiple routes
router.use('/admin', requireAdmin);
router.get('/admin/users', getUsersHandler);
router.get('/admin/settings', getSettingsHandler);
```

### Role-Based Access

```typescript
import { requireRole } from '../middleware/admin.middleware.ts';

// Allow multiple roles
router.get('/moderation', requireRole(['admin', 'moderator']), handler);

// Single role
router.delete('/users/:id', requireRole(['admin']), deleteUserHandler);
```

### Non-Blocking Admin Check

```typescript
import { checkAdmin } from '../middleware/admin.middleware.ts';

router.get('/api/data', checkAdmin, (req, res) => {
  if ((req as any).isAdmin) {
    // Return admin view with sensitive data
    return res.json({ data: allData, isAdmin: true });
  } else {
    // Return user view with filtered data
    return res.json({ data: publicData, isAdmin: false });
  }
});
```

## Available Roles

Currently supported roles:
- `admin` - Full system access
- `user` - Default role (no special access)

### Adding More Roles

To add more roles (e.g., `moderator`, `support`):

1. **Update Clerk Metadata:**
   ```json
   {
     "role": "moderator"
   }
   ```

2. **Use `requireRole` Middleware:**
   ```typescript
   router.get('/moderate', requireRole(['admin', 'moderator']), handler);
   ```

## Security Considerations

### ✅ Best Practices

1. **Use Public Metadata for Roles**
   - Roles are not sensitive information
   - Public metadata is included in JWT tokens
   - Faster access (no extra API call needed in some cases)

2. **Always Verify on Backend**
   - Never trust client-side role checks
   - Always use middleware on protected routes

3. **Log Admin Actions**
   - All admin access is logged with user ID and email
   - Monitor logs for suspicious activity

4. **Limit Admin Users**
   - Only grant admin access to trusted users
   - Regularly audit admin user list

### ⚠️ Security Notes

- **Public Metadata is Readable**: Anyone with a valid token can read public metadata
- **Not for Sensitive Data**: Don't store sensitive information in public metadata
- **Backend Verification**: Always verify roles on the backend, never trust client

## Troubleshooting

### Issue: User has admin role but gets 403

**Possible Causes:**
1. Metadata not saved correctly
2. User needs to log out and log back in
3. Token not refreshed

**Solution:**
```bash
# Check user metadata via Clerk API
curl https://api.clerk.com/v1/users/{user_id} \
  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY"

# Look for publicMetadata.role in response
```

### Issue: All requests return 401

**Possible Causes:**
1. Clerk middleware not applied
2. Invalid or expired token
3. CLERK_SECRET_KEY not set

**Solution:**
- Check `apps/api/src/index.ts` has `clerkMiddleware()`
- Verify token is valid
- Check environment variables

### Issue: Admin middleware not applied

**Possible Causes:**
1. Route registered before middleware
2. Middleware not imported

**Solution:**
```typescript
// ❌ Wrong - route before middleware
router.use('/admin', metricsRouter);
router.use('/admin', requireAdmin);

// ✅ Correct - middleware before routes
router.use('/admin', requireAdmin);
router.use('/admin', metricsRouter);
```

## Monitoring

### Admin Access Logs

All admin access attempts are logged:

```
Admin access granted: User user_abc123 (admin@example.com)
Access denied: User user_def456 attempted to access admin endpoint without admin role
```

### Recommended Monitoring

1. **Set up alerts** for failed admin access attempts
2. **Track admin actions** in application logs
3. **Regular audits** of admin user list
4. **Monitor** for unusual admin activity patterns

## Migration from Other Systems

### From Environment Variable Whitelist

If you were using `ADMIN_USER_IDS`:

1. Get list of admin user IDs from env var
2. For each user ID, update Clerk metadata
3. Remove `ADMIN_USER_IDS` from environment
4. Deploy new middleware

### From Database Roles

If you have roles in database:

1. Query all admin users from database
2. Update Clerk metadata for each user
3. Optionally keep database roles for audit trail
4. Update middleware to use Clerk metadata

## Next Steps

1. ✅ Set up your first admin user in Clerk Dashboard
2. ✅ Test admin access with the provided cURL commands
3. ✅ Update frontend to show/hide admin features
4. ⏳ Add admin UI components (next step)

## Related Documentation

- [Clerk Metadata Documentation](https://clerk.com/docs/users/metadata)
- [Admin Routes Documentation](./docs/API_DOCUMENTATION.md#admin-endpoints)
- [Error Handling](./src/middleware/error.middleware.ts)

