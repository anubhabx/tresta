# Keyboard Shortcuts for Moderation

## Overview
The moderation interface includes comprehensive keyboard shortcuts to speed up the testimonial review process. This feature is designed specifically for solo developers who need to efficiently moderate multiple testimonials.

## Design Pattern
The implementation follows a **non-intrusive design pattern**:
- ✅ **Floating Guide** - Top-right corner guide that can be expanded/collapsed/dismissed
- ✅ **Bulk Action Bar** - Fixed bottom bar shows shortcuts on action buttons
- ❌ **No Card Badges** - Individual testimonial cards remain clean without shifting content

This ensures:
- No content shifting when selecting testimonials
- Shortcuts are visible where they're actually used (bulk actions)
- Help is available but doesn't clutter the interface
- Clean, minimal aesthetic maintained

## Features Implemented

### 1. **Floating Keyboard Guide** (`keyboard-guide.tsx`)
A collapsible guide in the top-right corner that:
- Shows when in moderation mode
- Can be expanded to see all shortcuts
- Can be dismissed by user
- Dynamically indicates when selection is needed
- Subtle animations (slide-in from right)

**States:**
- **Collapsed**: Shows hint "Click on cards to select, then use shortcuts"
- **Expanded**: Shows all shortcuts organized by category
- **Dismissed**: User can close it if not needed

### 2. **Keyboard Shortcut Hook** (`use-keyboard-shortcuts.ts`)
- Custom React hook for managing keyboard shortcuts
- Automatically ignores shortcuts when typing in input fields
- Supports modifier keys (Ctrl, Shift, Alt)
- Enables/disables shortcuts based on conditions

### 3. **Visual Indicators** (`keyboard-shortcut-badge.tsx`)
- Subtle keyboard shortcut badges
- Only shown on bulk action bar (not individual cards)
- Minimal design matching the overall aesthetic

## Available Shortcuts

### Single Testimonial Actions
When **ONE** testimonial is selected:

| Key | Action | Description |
|-----|--------|-------------|
| `A` | Approve | Approves the selected testimonial |
| `R` | Reject | Rejects the selected testimonial |
| `D` | Delete | Deletes the selected testimonial |
| `F` | Flag | Flags the testimonial for review |
| `X` | Clear | Deselects the testimonial |

### Bulk Actions
When **MULTIPLE** testimonials are selected:

| Key | Action | Description |
|-----|--------|-------------|
| `A` | Bulk Approve | Approves all selected testimonials |
| `R` | Bulk Reject | Rejects all selected testimonials |
| `F` | Bulk Flag | Flags all selected testimonials |
| `X` | Clear All | Deselects all testimonials |

### Selection Shortcuts

| Key Combination | Action | Description |
|----------------|--------|-------------|
| `Shift + A` | Select/Deselect All | Toggles selection of all testimonials on current page |
| `Shift + P` | Select All Pending | Selects all testimonials with PENDING status |
| `Shift + V` | Select All Approved | Selects all testimonials with APPROVED status |
| `Shift + R` | Select All Rejected | Selects all testimonials with REJECTED status |
| `Shift + F` | Select All Flagged | Selects all testimonials with FLAGGED status |
| Click on card | Toggle Selection | Select or deselect individual testimonial |

## User Experience

### Selection Flow
1. Click on any testimonial card to select it (card shows blue ring)
2. Floating guide highlights available actions
3. Press the appropriate key to take action
4. Card automatically deselects after action completes

### Visual Feedback
- **Selected State**: Blue ring around card (`ring-2 ring-primary`)
- **Floating Guide**: Top-right corner, expandable/dismissable
- **Bulk Action Bar**: Fixed bottom bar with shortcut badges
- **Loading States**: Spinner replaces icon during action execution

### Smart Behavior
- Shortcuts only work in moderation mode
- Shortcuts are disabled while actions are processing
- Typing in search/filter inputs doesn't trigger shortcuts
- Single vs. bulk actions determined automatically by selection count
- Guide shows "(Select first)" when no items selected

## Implementation Details

### Component Updates

#### `keyboard-guide.tsx` (NEW)
- Floating card in top-right corner
- Collapsible with expand/collapse button
- Dismissable with X button
- Shows selection shortcuts and action shortcuts
- Dynamically updates based on selection state

#### `moderation-testimonial-card.tsx`
- **No keyboard badges on buttons** (prevents content shift)
- Made card clickable for selection (excluding buttons)
- Clean, consistent layout regardless of selection state

#### `testimonial-list.tsx`
- Imported and configured `useKeyboardShortcuts` hook
- Added `KeyboardGuide` component at top of moderation view
- Two shortcut sets:
  1. Action shortcuts (A, R, F, D, X) - enabled when items selected
  2. Select all (Shift + A) - always enabled in moderation mode
- Keyboard shortcut badges only on bulk action bar

### Accessibility
- Uses semantic `<kbd>` elements for keyboard indicators
- Clear visual distinction between selected/unselected states
- Prevents accidental actions by disabling during loading
- Provides help popover for discoverability

## Future Enhancements
- [ ] Navigation shortcuts (J/K for next/previous)
- [ ] Undo action (Ctrl + Z) integration
- [ ] Custom keyboard shortcut configuration
- [ ] Keyboard shortcut recording for new users
- [ ] Accessibility mode with audio feedback

## Testing Checklist
- [ ] Test single testimonial selection and actions
- [ ] Test bulk selection and actions
- [ ] Test Shift + A select all
- [ ] Verify shortcuts disabled when typing in search
- [ ] Test visual feedback (badges, rings, loading states)
- [ ] Test keyboard shortcuts help popover
- [ ] Verify shortcuts only work in moderation mode
- [ ] Test with different screen sizes (responsive bulk action bar)
