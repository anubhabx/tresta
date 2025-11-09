# Smart Selection Keyboard Shortcuts

## Overview

Enhanced the moderation system with smart selection shortcuts that allow users to instantly select all testimonials of a specific moderation status with a single keyboard combination.

## Implementation

### New Keyboard Shortcuts

| Shortcut    | Action              | Description                                                                        |
| ----------- | ------------------- | ---------------------------------------------------------------------------------- |
| `Shift + P` | Select All Pending  | Selects all testimonials with PENDING status                                       |
| `Shift + V` | Select All Approved | Selects all testimonials with APPROVED status (V for "approved" to avoid conflict) |
| `Shift + R` | Select All Rejected | Selects all testimonials with REJECTED status                                      |
| `Shift + F` | Select All Flagged  | Selects all testimonials with FLAGGED status                                       |
| `Shift + A` | Select/Deselect All | Toggles selection of all testimonials (existing)                                   |

### Key Design Decisions

1. **Key Mapping**:
   - Used `Shift + P` for **P**ending
   - Used `Shift + V` for appro**V**ed (A was already taken for Select All)
   - Used `Shift + R` for **R**ejected
   - Used `Shift + F` for **F**lagged

2. **User Feedback**:
   - Shows toast notification with count: "3 pending testimonial(s) selected"
   - Shows informative message when no testimonials of that status exist
   - Replaces current selection (doesn't toggle/add)

3. **Integration**:
   - Works with existing smart bulk actions system
   - After selection, bulk action buttons show valid counts
   - Action buttons disabled if no valid testimonials in selection

## Use Cases

### Scenario 1: Approve All Pending

1. Press `Shift + P` → Selects all pending testimonials
2. Press `A` → Approves all selected (only those actually pending)
3. Toast shows: "5 testimonials approved"

### Scenario 2: Flag All Approved for Re-review

1. Press `Shift + V` → Selects all approved testimonials
2. Press `F` → Flags all for review
3. Toast shows: "8 testimonials flagged for review"

### Scenario 3: Cleanup Rejected Testimonials

1. Press `Shift + R` → Selects all rejected testimonials
2. Review manually, deselect ones to keep
3. Press `D` (if one selected) or handle via UI for bulk delete

## Benefits

1. **Speed**: Instantly select testimonials by status without manual clicking
2. **Efficiency**: Combined with bulk actions, enables rapid moderation workflows
3. **Discoverability**: Shown in keyboard shortcuts help popover
4. **Safety**: Works with smart filtering - won't perform redundant updates

## Technical Implementation

### File: `testimonial-list.tsx`

Added new `useKeyboardShortcuts` hook with smart selection logic:

```typescript
useKeyboardShortcuts({
  enabled: moderationMode,
  shortcuts: [
    {
      key: "p",
      shift: true,
      action: () => {
        const pendingIds =
          filteredTestimonials
            ?.filter((t: Testimonial) => t.moderationStatus === "PENDING")
            .map((t: Testimonial) => t.id) || [];

        setSelectedIds(pendingIds);
        toast.success(
          pendingIds.length > 0
            ? `${pendingIds.length} pending testimonial(s) selected`
            : "No pending testimonials to select",
        );
      },
    },
    // ... similar for V, R, F
  ],
});
```

### File: `keyboard-shortcuts-help.tsx`

Updated help popover to include new shortcuts in the list.

### File: `KEYBOARD_SHORTCUTS.md`

Updated documentation with new selection shortcuts table.

## Future Enhancements

Potential improvements:

- Add `Shift + Cmd/Ctrl + [Key]` to **add to** selection instead of replacing
- Add shortcuts for selecting by other criteria (date ranges, rating, etc.)
- Add visual indicator showing which status is currently selected
- Add "Select None" explicit shortcut (currently `X` clears, or `Shift + A` when all selected)
