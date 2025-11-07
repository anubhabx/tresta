# Moderation Workflow Documentation

## Overview
This document describes the improved moderation workflow implemented to separate concerns between testimonial approval and publishing.

## Problem Statement
The previous implementation had several workflow issues:
1. **Duplicate flows**: Both testimonials page and moderation page had approve/reject buttons
2. **Missing validation**: Testimonials could be published without approval
3. **Confusing UX**: Users didn't understand the difference between the two pages

## Solution Architecture

### Two-Tab System
The testimonial management is split into two distinct pages with clear responsibilities:

#### 1. **Testimonials Tab** (Regular Mode)
- **Purpose**: Manage approved testimonials and control their publishing state
- **Available Actions**:
  - ✅ Publish (make visible in widgets)
  - ✅ Unpublish (hide from widgets)
  - ✅ Delete
- **Filters**: Shows only `isApproved = true` testimonials
- **Empty State**: "No Approved Testimonials - Approve testimonials in the Moderation tab first"

#### 2. **Moderation Tab** (Moderation Mode)
- **Purpose**: Review and approve/reject new testimonial submissions
- **Available Actions**:
  - ✅ Approve (moves to Testimonials tab)
  - ✅ Reject
  - ✅ Delete
- **Filters**: Shows only `PENDING`, `FLAGGED`, and `REJECTED` testimonials
- **Empty State**: "All Clear! - No testimonials need review"

## Implementation Details

### Backend Validation
**File**: `apps/api/src/controllers/testimonial.controller.ts`

```typescript
// In updateTestimonial function
if (isPublished === true && !existingTestimonial.isApproved) {
  throw new BadRequestError(
    "Cannot publish unapproved testimonial. Please approve it first in the moderation queue."
  );
}
```

This ensures testimonials cannot be published without approval, even if someone bypasses the UI.

### Component Architecture

#### TestimonialCard (Regular Mode)
**File**: `apps/web/components/testimonial-card.tsx`

**Props**:
```typescript
{
  testimonial: Testimonial;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Actions Removed**: 
- ❌ Approve button
- ❌ Reject button

#### ModerationTestimonialCard (Moderation Mode)
**File**: `apps/web/components/moderation/moderation-testimonial-card.tsx`

**Props**:
```typescript
{
  testimonial: Testimonial;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  loadingAction: 'approve' | 'reject' | 'delete' | null;
}
```

**Actions Removed**:
- ❌ Publish button
- ❌ Unpublish button

#### TestimonialList (Dual Mode)
**File**: `apps/web/components/testimonial-list.tsx`

**Mode-based Filtering**:
```typescript
if (moderationMode) {
  // Show only PENDING, FLAGGED, and REJECTED
  filtered = filtered.filter((t) => 
    t.moderationStatus === "PENDING" || 
    t.moderationStatus === "FLAGGED" || 
    t.moderationStatus === "REJECTED"
  );
} else {
  // Show only APPROVED testimonials
  filtered = filtered.filter((t) => t.isApproved === true);
}
```

**Conditional Card Rendering**:
```typescript
{moderationMode ? (
  <ModerationTestimonialCard
    onApprove={handleApprove}
    onReject={handleReject}
    onDelete={handleDelete}
  />
) : (
  <TestimonialCard
    onPublish={handlePublish}
    onUnpublish={handleUnpublish}
    onDelete={handleDelete}
  />
)}
```

## User Workflow

### Typical Flow
1. **Submission**: Customer submits testimonial via collection form
2. **Moderation Tab**: Testimonial appears with `PENDING` status
3. **Review**: Admin reviews and clicks "Approve"
4. **Success Toast**: "Testimonial approved! View in Testimonials tab to publish it."
5. **Testimonials Tab**: Approved testimonial now appears (unpublished by default)
6. **Publish**: Admin clicks "Publish" to make it visible in widgets

### Error Prevention
- Attempting to publish unapproved testimonial shows: "Cannot publish unapproved testimonial. Approve it in the Moderation tab first."
- Backend throws `BadRequestError` if publish attempted on unapproved testimonial

## Success Messages

### After Approval
✅ "Testimonial approved! View in Testimonials tab to publish it."

### After Publish
✅ "Testimonial published!"

### After Unpublish
✅ "Testimonial unpublished"

### After Rejection
✅ "Testimonial rejected"

## Empty States

### Moderation Tab - No Pending Items
- Icon: `ShieldCheck`
- Title: "All Clear!"
- Message: "No testimonials need review. All submissions have been processed."

### Testimonials Tab - No Approved Items
- Icon: `CheckCircle2`
- Title: "No Approved Testimonials"
- Message: "Approve testimonials in the Moderation tab first, then publish them here."

### First Time - No Submissions Yet
- Icon: `Inbox`
- Title: "No Testimonials Yet"
- Message: "Share your collection link to start receiving testimonials from your customers."
- Action: "Copy Collection Link" button

## Database Schema Reference

### Key Fields
- `isApproved` (Boolean): Whether testimonial passed moderation review
- `isPublished` (Boolean): Whether testimonial is visible in public widgets
- `moderationStatus` (Enum): `PENDING`, `APPROVED`, `REJECTED`, `FLAGGED`

### Valid State Combinations
- ✅ `isApproved: false, isPublished: false` - Awaiting moderation
- ✅ `isApproved: true, isPublished: false` - Approved but not published
- ✅ `isApproved: true, isPublished: true` - Approved and published
- ❌ `isApproved: false, isPublished: true` - **INVALID** (prevented by backend)

## Testing Checklist

- [ ] Submit new testimonial → appears in Moderation tab with PENDING status
- [ ] Approve testimonial → moves to Testimonials tab, shows success toast
- [ ] Try to publish unapproved testimonial → backend rejects with error message
- [ ] Publish approved testimonial → appears in widget
- [ ] Unpublish testimonial → hidden from widget but stays in Testimonials tab
- [ ] Reject testimonial → stays in Moderation tab with REJECTED status
- [ ] Empty state in Testimonials tab when no approved items
- [ ] Empty state in Moderation tab when all items processed
- [ ] Bulk approve in Moderation tab → all move to Testimonials tab

## Future Enhancements

### Potential Improvements
1. **Navigation Link**: Add "View in Moderation →" link in Testimonials empty state
2. **Badge Count**: Show pending count on Moderation tab header
3. **Auto-publish**: Option to auto-publish on approval (with user preference)
4. **Undo Rejection**: Allow re-approving rejected testimonials
5. **Approval History**: Track who approved/rejected and when

## Migration Notes

### Breaking Changes
- `TestimonialCard` no longer accepts `onApprove` or `onReject` props
- `ModerationTestimonialCard` no longer accepts `onPublish` or `onUnpublish` props
- Backend enforces approval before publishing (may break API clients)

### Backward Compatibility
- Existing approved testimonials remain approved
- Existing published testimonials remain published
- No database migration required (only validation logic added)
