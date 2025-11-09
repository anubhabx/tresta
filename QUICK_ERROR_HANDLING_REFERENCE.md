# Quick Error Handling Reference

Quick copy-paste patterns for implementing error handling in Tresta API.

---

## 🚀 Quick Start

### 1. Import Error Classes

```typescript
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
  ValidationError,
  handlePrismaError,
} from '../lib/errors.ts';
import { ResponseHandler } from '../lib/response.ts';
```

---

## 📝 Common Patterns

### String Validation

```typescript
// Required string
if (!name || typeof name !== 'string') {
  throw new ValidationError('Name is required and must be a string', {
    field: 'name',
    received: typeof name
  });
}

// Length validation
if (name.trim().length < 3 || name.length > 255) {
  throw new ValidationError('Name must be between 3 and 255 characters', {
    field: 'name',
    minLength: 3,
    maxLength: 255,
    received: name.length
  });
}

// Non-empty
if (name.trim().length === 0) {
  throw new ValidationError('Name cannot be empty', {
    field: 'name'
  });
}
```

### Number Validation

```typescript
// Required number
const limit = parseInt(req.body.limit);
if (isNaN(limit)) {
  throw new ValidationError('Limit must be a number', {
    field: 'limit',
    received: req.body.limit
  });
}

// Range validation
if (limit < 1 || limit > 100) {
  throw new ValidationError('Limit must be between 1 and 100', {
    field: 'limit',
    min: 1,
    max: 100,
    received: limit
  });
}
```

### Enum Validation

```typescript
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

---

## 🗄️ Database Operations

### Find Resource

```typescript
let resource;
try {
  resource = await prisma.resource.findUnique({
    where: { id: req.params.id }
  });
} catch (error) {
  throw handlePrismaError(error);
}

if (!resource) {
  throw new NotFoundError(`Resource with ID "${req.params.id}" not found`, {
    id: req.params.id,
    suggestion: 'Please check the resource ID'
  });
}
```

### Create Resource

```typescript
let created;
try {
  created = await prisma.resource.create({
    data: {
      name: name.trim(),
      userId: req.user.id,
      // ... other fields
    }
  });
} catch (error) {
  throw handlePrismaError(error);
}

ResponseHandler.created(res, {
  message: 'Resource created successfully',
  data: created
});
```

### Update Resource

```typescript
let updated;
try {
  updated = await prisma.resource.update({
    where: { id: req.params.id },
    data: updateData
  });
} catch (error) {
  throw handlePrismaError(error);
}

ResponseHandler.updated(res, {
  message: 'Resource updated successfully',
  data: updated
});
```

### Delete Resource

```typescript
try {
  await prisma.resource.delete({
    where: { id: req.params.id }
  });
} catch (error) {
  throw handlePrismaError(error);
}

ResponseHandler.deleted(res, 'Resource deleted successfully');
```

### Check Uniqueness

```typescript
let existing;
try {
  existing = await prisma.resource.findUnique({
    where: { slug }
  });
} catch (error) {
  throw handlePrismaError(error);
}

if (existing) {
  throw new ConflictError('Resource with this slug already exists', {
    field: 'slug',
    value: slug,
    suggestion: 'Please choose a different slug'
  });
}
```

---

## 🔐 Authentication & Authorization

### Check Authentication

```typescript
if (!req.user?.id) {
  throw new UnauthorizedError('Authentication required');
}
```

### Check Ownership

```typescript
if (resource.userId !== req.user.id) {
  throw new ForbiddenError('You do not have permission to access this resource', {
    resourceId: resource.id,
    userId: req.user.id,
    ownerId: resource.userId
  });
}
```

---

## 📤 Response Patterns

### Success Response

```typescript
ResponseHandler.success(res, {
  message: 'Resource retrieved successfully',
  data: resource
});
```

### Created Response (201)

```typescript
ResponseHandler.created(res, {
  message: 'Resource created successfully',
  data: created
});
```

### Updated Response

```typescript
ResponseHandler.updated(res, {
  message: 'Resource updated successfully',
  data: updated
});
```

### Deleted Response

```typescript
ResponseHandler.deleted(res, 'Resource deleted successfully');
```

### Paginated Response

```typescript
ResponseHandler.paginated(res, {
  data: resources,
  page: pageNum,
  limit: limitNum,
  total: totalCount,
  message: 'Resources retrieved successfully'
});
```

---

## 🎯 Complete Controller Template

```typescript
export async function createResourceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate authentication
    if (!req.user?.id) {
      throw new UnauthorizedError('Authentication required');
    }

    // 2. Validate required fields
    const { name, slug } = req.body;
    
    if (!name || typeof name !== 'string') {
      throw new ValidationError('Name is required and must be a string', {
        field: 'name',
        received: typeof name
      });
    }

    if (name.trim().length < 3 || name.length > 255) {
      throw new ValidationError('Name must be between 3 and 255 characters', {
        field: 'name',
        minLength: 3,
        maxLength: 255,
        received: name.length
      });
    }

    // 3. Check for duplicates
    let existing;
    try {
      existing = await prisma.resource.findUnique({
        where: { slug }
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    if (existing) {
      throw new ConflictError('Resource with this slug already exists', {
        field: 'slug',
        value: slug,
        suggestion: 'Please choose a different slug'
      });
    }

    // 4. Create resource
    let created;
    try {
      created = await prisma.resource.create({
        data: {
          name: name.trim(),
          slug: slug.toLowerCase().trim(),
          userId: req.user.id
        }
      });
    } catch (error) {
      throw handlePrismaError(error);
    }

    // 5. Send response
    ResponseHandler.created(res, {
      message: 'Resource created successfully',
      data: created
    });
  } catch (error) {
    next(error);
  }
}
```

---

## 🔍 Error Response Examples

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name must be between 3 and 255 characters",
    "details": {
      "field": "name",
      "minLength": 3,
      "maxLength": 255,
      "received": 2
    }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

### Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource with ID \"abc123\" not found",
    "details": {
      "id": "abc123",
      "suggestion": "Please check the resource ID"
    }
  },
  "meta": {
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

### Forbidden
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

---

## ✅ Checklist

When implementing a new endpoint:

- [ ] Import error classes and ResponseHandler
- [ ] Wrap handler in try-catch
- [ ] Check authentication (`req.user?.id`)
- [ ] Validate all inputs (type, length, range)
- [ ] Wrap Prisma calls with try-catch
- [ ] Use `handlePrismaError` for database errors
- [ ] Check resource exists after fetch
- [ ] Verify ownership/permissions
- [ ] Include helpful details in errors
- [ ] Use appropriate ResponseHandler method
- [ ] Pass errors to `next(error)`

---

**Keep this reference handy for quick implementation!**

