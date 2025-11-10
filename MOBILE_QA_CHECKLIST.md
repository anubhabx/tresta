# Mobile-First Responsive Design - QA Checklist

## Testing Overview
Use this checklist to verify mobile-first responsive design implementation across all dashboard pages.

---

## Device Testing Matrix

### Required Devices
- [ ] iPhone (iOS Safari) - Any model
- [ ] Android Phone (Chrome) - Any model
- [ ] iPad or Android Tablet
- [ ] Desktop Browser (Chrome/Firefox/Safari)

### Browser DevTools Testing
- [ ] Chrome DevTools - Mobile emulation
- [ ] Firefox Responsive Design Mode
- [ ] Safari Web Inspector

---

## General Checks (All Pages)

### Layout
- [ ] No horizontal scrolling (except intentional)
- [ ] Content fits within viewport
- [ ] Proper spacing on all screen sizes
- [ ] No overlapping elements
- [ ] Floating action button doesn't block content

### Typography
- [ ] Text is readable without zooming
- [ ] Font sizes scale appropriately
- [ ] Line heights are comfortable
- [ ] No text overflow or truncation issues

### Touch Targets
- [ ] All buttons are at least 44x44px on mobile
- [ ] Adequate spacing between touch targets
- [ ] Touch targets respond immediately
- [ ] No accidental taps on nearby elements

### Navigation
- [ ] Sidebar works on mobile
- [ ] Breadcrumbs are visible and functional
- [ ] Back navigation works correctly
- [ ] Tab navigation is accessible

---

## Page-Specific Checks

### Dashboard Shell
- [ ] Sidebar toggles correctly on mobile
- [ ] Header is sticky on scroll
- [ ] Breadcrumbs don't overflow
- [ ] Floating "New Project" button:
  - [ ] Visible on mobile
  - [ ] Shows icon only on mobile
  - [ ] Shows text on desktop
  - [ ] Doesn't block content
  - [ ] Has proper shadow/visibility

### Projects List Page (`/projects`)
- [ ] Projects display in single column on mobile
- [ ] Projects display in 2 columns on tablet
- [ ] Projects display in 2-3 columns on desktop
- [ ] Card spacing is appropriate
- [ ] Project cards are tappable
- [ ] Badge displays correctly
- [ ] Empty state displays correctly

### Project Detail Page (`/projects/[slug]`)

#### Header Section
- [ ] Project avatar displays correctly
- [ ] Project name doesn't overflow
- [ ] Description is readable (line-clamped on mobile)
- [ ] Edit button:
  - [ ] Icon only on mobile
  - [ ] Text visible on desktop
  - [ ] Proper touch target size
- [ ] Delete button:
  - [ ] Icon only on mobile
  - [ ] Text visible on desktop
  - [ ] Proper touch target size

#### Stats Cards
- [ ] Cards stack vertically on mobile
- [ ] Cards display in 3 columns on tablet/desktop
- [ ] Icons are visible and properly sized
- [ ] Numbers are readable
- [ ] Labels are clear

#### Tabs Navigation
- [ ] All 6 tabs are accessible on mobile
- [ ] Tabs scroll horizontally on mobile
- [ ] Active tab is clearly indicated
- [ ] Tab text doesn't wrap
- [ ] Smooth scrolling between tabs

#### Overview Tab
- [ ] Collection URL is fully visible
- [ ] URL breaks properly (no truncation)
- [ ] Copy button works
- [ ] Visit button works
- [ ] Buttons stack on mobile
- [ ] Info box displays correctly

#### Testimonials Tab
- [ ] Testimonials list displays correctly
- [ ] Cards are readable on mobile
- [ ] Actions are accessible
- [ ] Pagination works

#### Moderation Tab
- [ ] Filter presets scroll horizontally
- [ ] Scroll indicator visible on mobile
- [ ] Snap scrolling works
- [ ] Stats dashboard displays correctly
- [ ] Bulk actions bar works on mobile
- [ ] Selection checkboxes are tappable

#### Widgets Tab
- [ ] Widget cards display correctly
- [ ] Action buttons are accessible
- [ ] Create widget button:
  - [ ] Full width on mobile
  - [ ] Auto width on desktop
  - [ ] Proper touch target
- [ ] Empty state displays correctly

#### API Keys Tab
- [ ] **Mobile (< 768px):**
  - [ ] Keys display as cards
  - [ ] All information is visible
  - [ ] Revoke button is full width
  - [ ] Proper touch target size
  - [ ] No horizontal scrolling
- [ ] **Desktop (≥ 768px):**
  - [ ] Keys display in table
  - [ ] All columns are visible
  - [ ] Table is readable
  - [ ] Actions are accessible
- [ ] Create dialog works on mobile
- [ ] Copy functionality works

#### Settings Tab
- [ ] Form fields are accessible
- [ ] Inputs are easy to tap
- [ ] Buttons are properly sized
- [ ] Delete confirmation works

---

## Interaction Testing

### Touch Interactions
- [ ] Tap targets respond immediately
- [ ] No double-tap zoom on buttons
- [ ] Swipe gestures work where applicable
- [ ] Long press doesn't cause issues
- [ ] Pinch zoom works on content (not UI)

### Scroll Behavior
- [ ] Smooth scrolling throughout
- [ ] Sticky elements stay in place
- [ ] No scroll jank or lag
- [ ] Horizontal scroll works where intended
- [ ] Vertical scroll is smooth

### Form Interactions
- [ ] Inputs are easy to tap
- [ ] Keyboard doesn't hide inputs
- [ ] Autocomplete works
- [ ] Validation messages are visible
- [ ] Submit buttons are accessible

---

## Breakpoint Testing

Test at these specific widths:

### 375px (iPhone SE)
- [ ] All content is accessible
- [ ] No layout breaks
- [ ] Touch targets are adequate
- [ ] Text is readable

### 390px (iPhone 12/13/14)
- [ ] Layout is comfortable
- [ ] All features work
- [ ] Good use of space

### 430px (iPhone 14 Pro Max)
- [ ] Layout scales well
- [ ] No wasted space
- [ ] Comfortable reading

### 640px (Tablet Portrait)
- [ ] Transition to tablet layout
- [ ] 2-column grids appear
- [ ] Text sizes increase
- [ ] Button text appears

### 768px (iPad)
- [ ] Full tablet experience
- [ ] API keys show table
- [ ] 3-column stats
- [ ] Proper spacing

### 1024px (Desktop)
- [ ] Desktop layout active
- [ ] All features visible
- [ ] Optimal spacing
- [ ] Full functionality

### 1280px+ (Large Desktop)
- [ ] 3-column project grid
- [ ] Generous spacing
- [ ] No wasted space
- [ ] Comfortable layout

---

## Orientation Testing

### Portrait Mode
- [ ] All pages work in portrait
- [ ] Content is accessible
- [ ] Navigation works
- [ ] No layout issues

### Landscape Mode
- [ ] All pages work in landscape
- [ ] Content adapts properly
- [ ] No overflow issues
- [ ] Good use of width

---

## Performance Testing

### Mobile Network
- [ ] Test on 3G connection
- [ ] Test on 4G connection
- [ ] Images load properly
- [ ] No layout shift during load
- [ ] Smooth interactions

### Loading States
- [ ] Skeletons display correctly
- [ ] Loading indicators are visible
- [ ] No flash of unstyled content
- [ ] Smooth transitions

---

## Accessibility Testing

### Screen Reader
- [ ] All interactive elements are announced
- [ ] Navigation is logical
- [ ] Form labels are read correctly
- [ ] Error messages are announced

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] All actions are keyboard accessible
- [ ] No keyboard traps

### Visual
- [ ] Sufficient color contrast
- [ ] Text is readable
- [ ] Icons have labels
- [ ] Focus states are clear

---

## Browser Compatibility

### iOS Safari
- [ ] Layout works correctly
- [ ] Touch interactions work
- [ ] No rendering issues
- [ ] Smooth scrolling

### Chrome Mobile
- [ ] Layout works correctly
- [ ] Touch interactions work
- [ ] No rendering issues
- [ ] Smooth scrolling

### Firefox Mobile
- [ ] Layout works correctly
- [ ] Touch interactions work
- [ ] No rendering issues
- [ ] Smooth scrolling

### Samsung Internet
- [ ] Layout works correctly
- [ ] Touch interactions work
- [ ] No rendering issues
- [ ] Smooth scrolling

---

## Edge Cases

### Long Content
- [ ] Long project names handle well
- [ ] Long URLs display properly
- [ ] Long descriptions are readable
- [ ] Overflow is handled

### Empty States
- [ ] Empty projects list displays correctly
- [ ] Empty testimonials displays correctly
- [ ] Empty widgets displays correctly
- [ ] Empty API keys displays correctly

### Error States
- [ ] Error messages are visible
- [ ] Error messages don't break layout
- [ ] Recovery actions are accessible
- [ ] Errors are dismissible

### Loading States
- [ ] Skeletons match final layout
- [ ] Loading doesn't break layout
- [ ] Smooth transition to content
- [ ] No layout shift

---

## Regression Testing

### Desktop Experience
- [ ] Desktop layout still works
- [ ] No features broken
- [ ] Performance maintained
- [ ] Visual quality maintained

### Tablet Experience
- [ ] Tablet layout works
- [ ] Proper breakpoint transitions
- [ ] Good use of space
- [ ] All features accessible

---

## Sign-Off

### Tester Information
- **Name:** _______________
- **Date:** _______________
- **Device(s) Used:** _______________
- **Browser(s) Used:** _______________

### Results
- [ ] All critical issues resolved
- [ ] All high priority issues resolved
- [ ] Medium priority issues documented
- [ ] Low priority issues documented

### Issues Found
```
Issue #1: _______________________________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Status: [ ] Open [ ] Fixed [ ] Won't Fix

Issue #2: _______________________________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Status: [ ] Open [ ] Fixed [ ] Won't Fix

Issue #3: _______________________________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Status: [ ] Open [ ] Fixed [ ] Won't Fix
```

### Overall Assessment
- [ ] **PASS** - Ready for production
- [ ] **PASS WITH NOTES** - Minor issues, can deploy
- [ ] **FAIL** - Critical issues, needs fixes

### Notes
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## Quick Test Script

For rapid testing, follow this sequence:

1. **Mobile (375px)**
   - Open `/projects`
   - Tap a project
   - Navigate through all tabs
   - Test one action per tab

2. **Tablet (768px)**
   - Repeat above
   - Verify layout changes
   - Test API keys table

3. **Desktop (1280px)**
   - Repeat above
   - Verify all features
   - Test full functionality

**Time Estimate:** 15-20 minutes per device

---

## Automated Testing Commands

```bash
# Run visual regression tests (if available)
npm run test:visual

# Run accessibility tests
npm run test:a11y

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

---

## Resources

- **Design Specs:** MOBILE_RESPONSIVE_VISUAL_GUIDE.md
- **Implementation Details:** MOBILE_RESPONSIVE_IMPROVEMENTS.md
- **Development Guidelines:** MOBILE_FIRST_GUIDELINES.md
- **Summary:** MOBILE_RESPONSIVE_SUMMARY.md
