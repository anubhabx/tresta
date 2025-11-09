# Error Handling Implementation Checklist

Use this checklist when implementing error handling in any API controller.

---

## 📋 Pre-Implementation

- [ ] Read `apps/api/ERROR_HANDLING.md` for patterns and examples
- [ ] Review `apps/api/src/controllers/api-key.controller.ts` as reference
- [ ] Import required error classes and utilities

```typescript
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError, 
  ValidationError,
  UnauthorizedError,
  handlePrismaError 
} from '../lib/errors.ts';
import { ResponseHandler } from '../lib/response.ts';
```

---

## ✅ Input Validation

### Required Fields
- [ ] Check if required fields exist
- [ ] Validate field types (string, number, boolean, object)
- [ ] Provide clear error messages with field names

```typescript
if (!name || typeof name !== 'string') {
  throw new ValidationError('Name is required and must be a string', {
    field: 'name',
    received: typeof name
  });
}
```

### String Validation
- [ ] Check minimum length
- [ ] Check maximum length
- [ ] Trim whitespace before validation
- [ ] Validate format (email, URL, etc.)

```typescript
if (name.trim().length < 3) {
  throw new ValidationError('Name must be at least 3 characters', {
    field: 'name',
    minLength: 3,
    received: name.trim().length
  });
}
```

### Number Validation
- [ ] Check if valid number (not NaN)
- [ ] Validate minimum value
- [ ] Validate maximum value
- [ ] Check for positive/negative constraints

```typescript
const limit = parseInt(req.body.limit);
if (isNaN(limit) || limit < 1 || limit > 100) {
  throw new ValidationError('Limit must be between 1 and 100', {
    field: 'limit',
    min: 1,
    max: 100,
    received: req.body.limit
  });
}
```

### Enum Validation
- [ ] Check if value is in allowed list
- [ ] Provide list of allowed values in error

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
- [ ] Check if valid date format
- [ ] Validate date is in future (if required)
- [ ] Validate date range

```typescript
const date = new Date(dateString);
if (isNaN(date.getTime())) {
  throw new ValidationError('Invalid date format', {
    field: 'expiresAt',
    received: dateString,
    expected: 'ISO 8601 date string'
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

## 🔐 Authentication & Authorization

### Authentication Check
- [ ] Verify user is authenticated
- [ ] Check `req.user?.id` exists
- [ ] Throw `UnauthorizedError` if not authenticated

```typescript
if (!req.user?.id) {
  throw new UnauthorizedError('Authentication required');
}
```

### Authorization Check
- [ ] Verify user owns the resource
- [ ] Check user has required permissions
- [ ] Throw `ForbiddenError` with context

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

## 🗄️ Database Operations

### Finding Resources
- [ ] Wrap Prisma calls in try-catch
- [ ] Use `handlePrismaError` for errors
- [ ] Check if resource exists
- [ ] Throw `NotFoundError` with helpful details

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
    suggestion: 'Please check the resource ID and try again'
  });
}
```

### Creating Resources
- [ ] Validate all input data
- [ ] Wrap create operation in try-catch
- [ ] Use `handlePrismaError` for errors
- [ ] Return created resource with 201 status

```typescript
let created;
try {
  created = await prisma.resource.create({ data });
} catch (error) {
  throw handlePrismaError(error);
}

ResponseHandler.created(res, {
  message: 'Resource created successfully',
  data: created
});
```

### Updating Resources
- [ ] Find resource first
- [ ] Check ownership
- [ ] Validate update data
- [ ] Wrap update in try-catch
- [ ] Use `handlePrismaError`

```typescript
try {
  const updated = await prisma.resource.update({
    where: { id: req.params.id },
    data: req.body
  });
  
  ResponseHandler.updated(res, { data: updated });
} catch (error) {
  throw handlePrismaError(error);
}
```

### Deleting Resources
- [ ] Find resource first
- [ ] Check ownership
- [ ] Check for dependent resources
- [ ] Wrap delete in try-catch
- [ ] Confirm deletion

```typescript
try {
  await prisma.resource.delete({
    where: { id: req.params.id }
  });
  
  ResponseHandler.deleted(res, 'Resource deleted successfully');
} catch (error) {
  throw handlePrismaError(error);
}
```

---

## 📝 Service Layer

### Service Function Pattern
- [ ] Validate inputs at service level
- [ ] Throw descriptive errors
- [ ] Re-throw with context
- [ ] Handle edge cases

```typescript
export async function createResource(data: ResourceData): Promise<Resource> {
  try {
    // Validate
    if (!data.name) {
      throw new Error('Name is required');
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

---

## 📤 Response Handling

### Success Responses
- [ ] Use `ResponseHandler` methods
- [ ] Provide clear success messages
- [ ] Include relevant data
- [ ] Use appropriate status codes

```typescript
// 200 OK
ResponseHandler.success(res, {
  message: 'Resource retrieved successfully',
  data: resource
});

// 201 Created
ResponseHandler.created(res, {
  message: 'Resource created successfully',
  data: created
});

// 200 Updated
ResponseHandler.updated(res, {
  message: 'Resource updated successfully',
  data: updated
});

// 200 Deleted
ResponseHandler.deleted(res, 'Resource deleted successfully');
```

### Pagination
- [ ] Validate page and limit parameters
- [ ] Use `ResponseHandler.paginated`
- [ ] Include total count

```typescript
ResponseHandler.paginated(res, {
  data: resources,
  page: pageNum,
  limit: limitNum,
  total: totalCount
});
```

---

## 🎯 Error Handling

### Try-Catch Structure
- [ ] Wrap entire handler in try-catch
- [ ] Pass all errors to `next(error)`
- [ ] Never send error responses directly

```typescript
export async function handler(req: Request, res: Response, next: NextFunction) {
  try {
    // All logic here
  } catch (error) {
    next(error); // Always pass to middleware
  }
}
```

### Error Details
- [ ] Include field names in validation errors
- [ ] Provide expected vs received values
- [ ] Add helpful suggestions
- [ ] Include resource IDs for debugging

```typescript
throw new ValidationError('Invalid email format', {
  field: 'email',
  received: email,
  pattern: '/^[^@]+@[^@]+\.[^@]+$/',
  suggestion: 'Please provide a valid email address'
});
```

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Test with missing required fields
- [ ] Test with invalid data types
- [ ] Test with out-of-range values
- [ ] Test with non-existent resources
- [ ] Test without authentication
- [ ] Test with wrong user (authorization)
- [ ] Test with duplicate data (conflicts)

### Error Response Validation
- [ ] Verify error has `success: false`
- [ ] Verify error has correct `code`
- [ ] Verify error has clear `message`
- [ ] Verify error includes helpful `details`
- [ ] Verify error has `timestamp` in meta

---

## 📊 Code Quality

### Readability
- [ ] Clear variable names
- [ ] Logical flow (validate → auth → fetch → authorize → operate)
- [ ] Consistent error handling pattern
- [ ] Comments for complex logic

### Maintainability
- [ ] No code duplication
- [ ] Reusable validation functions
- [ ] Consistent error messages
- [ ] Easy to add new validations

### Performance
- [ ] Validate before database queries
- [ ] Use select to limit returned fields
- [ ] Avoid N+1 queries
- [ ] Use transactions for multiple operations

---

## 📚 Documentation

### Code Comments
- [ ] Document complex validation logic
- [ ] Explain business rules
- [ ] Note security considerations

### API Documentation
- [ ] Document all possible error responses
- [ ] Include example error responses
- [ ] List validation rules
- [ ] Explain authorization requirements

---

## ✅ Final Review

Before committing:
- [ ] All inputs validated
- [ ] All database operations wrapped with error handling
- [ ] All errors passed to middleware
- [ ] Clear, helpful error messages
- [ ] Consistent with other controllers
- [ ] TypeScript compilation passes
- [ ] No linting errors
- [ ] Tested manually

---

## 🎓 Quick Reference

### Common Errors

```typescript
// Missing required field
throw new ValidationError('Field is required', { field: 'name' });

// Invalid type
throw new ValidationError('Must be a string', { 
  field: 'name', 
  received: typeof value 
});

// Out of range
throw new ValidationError('Must be between 1 and 100', {
  field: 'limit',
  min: 1,
  max: 100,
  received: value
});

// Not authenticated
throw new UnauthorizedError('Authentication required');

// Not authorized
throw new ForbiddenError('Access denied', { resourceId });

// Not found
throw new NotFoundError('Resource not found', { 
  id, 
  suggestion: 'Check the ID' 
});

// Already exists
throw new ConflictError('Resource already exists', { field: 'name' });

// Database error
throw handlePrismaError(error);
```

---

**Use this checklist for every controller to ensure consistent, high-quality error handling!**

