# API Error Handling Guide

## Overview

This document describes the comprehensive error handling system implemented in the Tresta API. The system provides consistent, informative error responses across all endpoints.

## Error Response Format

All error responses follow this standardized structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional context (optional)
    }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

## Error Classes

### Base Error Class

```typescript
class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;
}
```

### Available Error Classes

| Class | Status Code | Error Code | Use Case |
|-------|-------------|------------|----------|
| `BadRequestError` | 400 | `BAD_REQUEST` | Invalid request parameters or malformed data |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| `ForbiddenError` | 403 | `FORBIDDEN` | Authenticated but lacks permission |
| `NotFoundError` | 404 | `NOT_FOUND` | Resource doesn't exist |
| `ConflictError` | 409 | `CONFLICT` | Resource already exists (e.g., duplicate) |
| `ValidationError` | 422 | `VALIDATION_ERROR` | Input validation failed |
| `RateLimitError` | 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| `InternalServerError` | 500 | `INTERNAL_ERROR` | Unexpected server error |
| `ServiceUnavailableError` | 503 | `SERVICE_UNAVAILABLE` | Service temporarily down |

## Usage Examples

### 1. Basic Error Throwing

```typescript
// Simple error
throw new BadRequestError('Invalid input');

// Error with details
throw new ValidationError('Name is required', {
  field: 'name',
  received: undefined,
  expected: 'string'
});
```

### 2. Prisma Error Handling

```typescript
import { handlePrismaError } from '../lib/errors.ts';

try {
  const user = await prisma.user.create({ data });
} catch (error) {
  throw handlePrismaError(error);
}
```

The `handlePrismaError` function automatically maps Prisma errors:

| Prisma Code | Mapped Error | Description |
|-------------|--------------|-------------|
| P2002 | `ConflictError` | Unique constraint violation |
| P2025 | `NotFoundError` | Record not found |
| P2003 | `BadRequestError` | Foreign key constraint failed |
| P2014 | `BadRequestError` | Relation violation |
| P2015 | `NotFoundError` | Related record not found |
| P2021 | `InternalServerError` | Table doesn't exist |
| P2022 | `InternalServerError` | Column doesn't exist |

### 3. Controller Pattern

```typescript
export async function createResourceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate input
    if (!req.body.name) {
      throw new ValidationError('Name is required', {
        field: 'name',
        received: req.body.name
      });
    }

    // 2. Check authentication
    if (!req.user?.id) {
      throw new UnauthorizedError('Authentication required');
    }

    // 3. Check authorization
    const resource = await getResource(req.params.id);
    if (resource.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    // 4. Perform operation with Prisma error handling
    let result;
    try {
      result = await prisma.resource.create({ data });
    } catch (error) {
      throw handlePrismaError(error);
    }

    // 5. Send success response
    ResponseHandler.created(res, {
      message: 'Resource created successfully',
      data: result
    });
  } catch (error) {
    // 6. Pass to error middleware
    next(error);
  }
}
```

## Validation Best Practices

### Input Validation

Always validate inputs before processing:

```typescript
// Check required fields
if (!name || typeof name !== 'string') {
  throw new ValidationError('Name is required and must be a string', {
    field: 'name',
    received: typeof name
  });
}

// Check length constraints
if (name.trim().length < 3) {
  throw new ValidationError('Name must be at least 3 characters', {
    field: 'name',
    minLength: 3,
    received: name.trim().length
  });
}

// Check numeric ranges
if (limit < 1 || limit > 100) {
  throw new ValidationError('Limit must be between 1 and 100', {
    field: 'limit',
    min: 1,
    max: 100,
    received: limit
  });
}

// Check enum values
const validTypes = ['live', 'test'];
if (!validTypes.includes(type)) {
  throw new ValidationError('Invalid type', {
    field: 'type',
    allowed: validTypes,
    received: type
  });
}
```

### Date Validation

```typescript
const date = new Date(dateString);
if (isNaN(date.getTime())) {
  throw new ValidationError('Invalid date format', {
    field: 'expiresAt',
    received: dateString,
    expected: 'ISO 8601 date string (e.g., 2025-12-31T23:59:59Z)'
  });
}

if (date <= new Date()) {
  throw new ValidationError('Date must be in the future', {
    field: 'expiresAt',
    received: date.toISOString(),
    minimum: new Date().toISOString()
  });
}
```

## Error Details Structure

Provide helpful context in error details:

```typescript
// Resource not found
throw new NotFoundError(`Project with slug "${slug}" not found`, {
  slug,
  suggestion: 'Please check the project slug and try again'
});

// Permission denied
throw new ForbiddenError('You do not have permission to access this resource', {
  resourceId: resource.id,
  userId: req.user.id,
  ownerId: resource.userId
});

// Validation error
throw new ValidationError('Invalid email format', {
  field: 'email',
  received: email,
  pattern: '/^[^@]+@[^@]+\.[^@]+$/'
});

// Already exists
throw new ConflictError('API key with this name already exists', {
  field: 'name',
  value: name,
  suggestion: 'Please choose a different name'
});
```

## Service Layer Error Handling

Services should throw descriptive errors:

```typescript
export async function createResource(data: ResourceData): Promise<Resource> {
  try {
    // Validate inputs
    if (!data.name) {
      throw new Error('Name is required');
    }

    if (data.name.length < 3) {
      throw new Error('Name must be at least 3 characters');
    }

    // Perform operation
    return await prisma.resource.create({ data });
  } catch (error) {
    // Re-throw with context
    if (error instanceof Error) {
      throw new Error(`Failed to create resource: ${error.message}`);
    }
    throw new Error('Failed to create resource due to an unknown error');
  }
}
```

## Error Middleware

The global error middleware handles all errors:

```typescript
// Automatically handles:
// - ApiError instances (custom errors)
// - Zod validation errors
// - JWT/Token errors
// - Multer file upload errors
// - Database connection errors
// - JSON parsing errors
// - Unknown errors (500)
```

### Development vs Production

- **Development**: Includes stack traces and detailed error info
- **Production**: Sanitized messages, no stack traces, proper logging

## Testing Error Responses

### Example Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid input",
    "details": {
      "field": "email",
      "received": "invalid-email"
    }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token has expired"
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource",
    "details": {
      "resourceId": "abc123",
      "userId": "user_xyz",
      "ownerId": "user_abc"
    }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project with slug \"my-project\" not found",
    "details": {
      "slug": "my-project",
      "suggestion": "Please check the project slug and try again"
    }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

#### 422 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name must be at least 3 characters",
    "details": {
      "field": "name",
      "minLength": 3,
      "received": 2
    }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

#### 429 Rate Limit
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 100,
      "window": "1 hour",
      "retryAfter": 3600
    }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

## Checklist for New Endpoints

When creating a new endpoint, ensure:

- [ ] All inputs are validated (type, length, format, range)
- [ ] Authentication is checked (`req.user?.id`)
- [ ] Authorization is verified (ownership, permissions)
- [ ] Prisma operations use `handlePrismaError`
- [ ] Service errors are caught and re-thrown with context
- [ ] Error details include helpful information
- [ ] Success responses use `ResponseHandler`
- [ ] All errors are passed to `next(error)`

## Common Patterns

### Pattern 1: CRUD Operation

```typescript
export async function updateResourceHandler(req, res, next) {
  try {
    // 1. Validate ID
    if (!req.params.id) {
      throw new ValidationError('Resource ID is required');
    }

    // 2. Check auth
    if (!req.user?.id) {
      throw new UnauthorizedError();
    }

    // 3. Find resource
    let resource;
    try {
      resource = await prisma.resource.findUnique({
        where: { id: req.params.id }
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    // 4. Check exists
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    // 5. Check ownership
    if (resource.userId !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    // 6. Update
    try {
      const updated = await prisma.resource.update({
        where: { id: req.params.id },
        data: req.body
      });
      
      ResponseHandler.updated(res, { data: updated });
    } catch (error) {
      throw handlePrismaError(error);
    }
  } catch (error) {
    next(error);
  }
}
```

### Pattern 2: List with Pagination

```typescript
export async function listResourcesHandler(req, res, next) {
  try {
    if (!req.user?.id) {
      throw new UnauthorizedError();
    }

    const { page = 1, limit = 10 } = req.query;
    
    // Validate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    if (isNaN(pageNum) || pageNum < 1) {
      throw new ValidationError('Page must be a positive number');
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const skip = (pageNum - 1) * limitNum;

    try {
      const [resources, total] = await Promise.all([
        prisma.resource.findMany({
          where: { userId: req.user.id },
          skip,
          take: limitNum
        }),
        prisma.resource.count({
          where: { userId: req.user.id }
        })
      ]);

      ResponseHandler.paginated(res, {
        data: resources,
        page: pageNum,
        limit: limitNum,
        total
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  } catch (error) {
    next(error);
  }
}
```

## Migration Guide

If you have existing endpoints without proper error handling:

1. Add input validation at the top
2. Wrap Prisma calls with try-catch and use `handlePrismaError`
3. Replace generic errors with specific error classes
4. Add helpful details to error objects
5. Ensure all errors are passed to `next(error)`

## Additional Resources

- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)

---

**Last Updated:** November 10, 2025
