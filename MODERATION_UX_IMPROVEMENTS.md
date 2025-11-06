# Auto-Moderation UX Improvements

## Summary
Enhanced the auto-moderation feature with better UX integration, advanced sentiment analysis, and data migration capabilities.

## Changes Made

### 1. Advanced Sentiment Analysis
**File**: `apps/api/src/services/moderation.service.ts`

- Replaced simple negative keyword list with weighted sentiment categories:
  - **NEGATIVE_KEYWORDS_SEVERE** (weight: 0.4): scam, fraud, illegal, lawsuit
  - **NEGATIVE_KEYWORDS_STRONG** (weight: 0.25): terrible, horrible, worst, hate
  - **NEGATIVE_KEYWORDS_MODERATE** (weight: 0.15): bad, disappointing, poor, slow
  - **POSITIVE_KEYWORDS** (weight: 0.2): excellent, amazing, fantastic, great

- **analyzeSentiment() Function**:
  - Returns sentiment score from -1 (very negative) to +1 (very positive)
  - Categorizes content: very_negative, negative, neutral, positive, very_positive
  - Lists detected keywords for transparency
  - Integrated into main moderation flow to reject/flag based on sentiment

### 2. Migration Script for Existing Testimonials
**File**: `apps/api/src/scripts/migrate-existing-testimonials.ts`

- Auto-moderates all existing PENDING testimonials
- Processes in batches of 50 to avoid database overload
- Respects project-level auto-moderation settings
- Outputs detailed statistics (approved/flagged/rejected counts)
- Run via: `pnpm migrate:testimonials` (added to package.json)

**Script Output Example**:
```
🔍 Starting migration of existing testimonials...
📊 Found 127 testimonials to moderate
✅ Processed abc123: APPROVED (score: 0.23)
✅ Processed def456: FLAGGED (score: 0.67)
📦 Batch 1 complete
...
🎉 Migration complete!
📊 Results:
    - Processed: 127
    - Approved: 89
    - Flagged: 31
    - Rejected: 7
```

### 3. Integrated Moderation in Testimonial List
**File**: `apps/web/components/testimonial-list.tsx`

**Before**: Separate moderation page at `/projects/[slug]/moderation`
**After**: Moderation integrated directly into testimonial list view

**Features**:
- **Select All Checkbox**: Bulk select testimonials for moderation
- **Moderation Filter Dropdown**: Filter by PENDING/APPROVED/FLAGGED/REJECTED
- **Moderation Stats**: Shows flagged/rejected counts in header badges
- **Checkboxes per Card**: Individual selection for bulk actions
- **Fixed Bottom Bulk Actions Bar**:
  - Appears only when testimonials are selected
  - Fixed positioning (doesn't shift content)
  - Three actions: Approve (green), Flag (yellow), Reject (red)
  - Clear button to deselect all

### 4. Enhanced Testimonial Card with Moderation Badges
**File**: `apps/web/components/testimonial-card.tsx`

**New getModerationBadge() Function**:
- Shows moderation status next to approval status
- Color-coded badges:
  - **APPROVED**: Green badge with Shield icon
  - **FLAGGED**: Red destructive badge with AlertTriangle icon
  - **REJECTED**: Red outline badge with XCircle icon
  - **PENDING**: No badge (default state)

**Tooltip Details**:
- Risk score (0-1, higher = more problematic)
- List of moderation flags (profanity, spam, sentiment issues)
- Truncates to first 3 flags + count of remaining

**Visual Integration**:
- Moderation badge positioned between status badge and verification badge
- Maintains clean vertical alignment in card header
- Responsive tooltips with detailed flag information

## UX Flow Comparison

### Before
1. User views testimonials in main list (no moderation info)
2. User clicks "Moderation" tab to see separate queue
3. User manages moderation in isolation from testimonials
4. Bulk actions shift page content (layout jump)

### After
1. User sees all moderation info inline with testimonials
2. Flagged/rejected items clearly visible with color-coded badges
3. Quick select + bulk actions for efficient moderation
4. Fixed bottom action bar prevents layout shift
5. Detailed hover tooltips show why items were flagged

## Technical Improvements

### Type Safety
- Added `ModerationFilter` type for filter dropdown
- Null-safe checks for `moderationScore` in tooltips
- Array type guards for `moderationFlags`

### State Management
- `selectedIds` state for bulk selection tracking
- `filterModeration` state for moderation status filtering
- TanStack Query cache invalidation on bulk actions

### Performance
- Batch processing in migration (50 items at a time)
- Efficient filtering with combined status + moderation checks
- Optimistic UI updates via TanStack Query mutations

## Migration Instructions

### For Existing Projects
1. Run migration script to auto-moderate existing testimonials:
   ```bash
   cd apps/api
   pnpm migrate:testimonials
   ```

2. Review flagged items in testimonial list (filter by "Flagged")

3. Use bulk actions to approve/reject flagged testimonials

### For New Testimonials
- Auto-moderation runs on submission
- Sentiment analysis checks every testimonial
- Flagged items appear with clear indicators
- Managers review and approve/reject inline

## Future Enhancements (Optional)

1. **AI-Powered Moderation**: Integrate OpenAI Moderation API or Perspective API
2. **Custom Rules Builder**: UI for custom profanity/keyword lists
3. **Moderation Analytics**: Dashboard showing trends in flagged content
4. **Appeal System**: Allow users to contest rejections
5. **A/B Testing**: Compare auto-moderation vs manual moderation efficiency

## Files Modified

### Backend
- ✅ `apps/api/src/services/moderation.service.ts` - Enhanced sentiment analysis
- ✅ `apps/api/src/scripts/migrate-existing-testimonials.ts` - Migration script
- ✅ `apps/api/package.json` - Added migrate:testimonials script

### Frontend
- ✅ `apps/web/components/testimonial-list.tsx` - Integrated moderation UI
- ✅ `apps/web/components/testimonial-card.tsx` - Moderation badges

### Configuration
- ✅ `packages/eslint-config/package.json` - Added @eslint/js dependency

## Testing Checklist

- [ ] Build succeeds without errors
- [ ] Migration script processes existing testimonials
- [ ] Moderation filter shows correct counts
- [ ] Select all checkbox works
- [ ] Bulk approve/reject/flag actions work
- [ ] Fixed bottom action bar appears/disappears correctly
- [ ] Moderation badges display with correct colors
- [ ] Tooltips show risk scores and flags
- [ ] Sentiment analysis detects positive/negative content
- [ ] Auto-rejection works for severe negative sentiment
- [ ] Flagging works for moderate negative sentiment
