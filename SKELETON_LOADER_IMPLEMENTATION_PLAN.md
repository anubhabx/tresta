# Skeleton Loader Implementation Plan

**Date:** November 10, 2025  
**Branch:** `feature/skeleton-loaders`  
**Status:** Planning Phase

---

## 🎯 Objective

Replace all `LoadingStars` animated loaders with modern skeleton loaders for better UX and perceived performance.

---

## 📊 Current State Analysis

### Current Loader Component
**File:** `apps/web/components/loader.tsx`

**Components:**
1. **LoadingStars** - Animated 5-star loader with GSAP animations
2. **InlineLoader** - Simple spinning Loader2 icon

**Usage Count:** 11 instances of LoadingStars across the app

---

## 📝 Components Requiring Skeleton Loaders

### 1. **Page-Level Loaders** (7 instances)

#### Dashboard Page
**File:** `apps/web/app/(dashboard)/dashboard/page.tsx`
**Current:** LoadingStars centered
**Needs:** 
- Dashboard stats skeleton (4 stat cards)
- Recent projects list skeleton (3-5 project cards)
- Quick actions section skeleton

#### Projects List Page
**File:** `apps/web/app/(dashboard)/projects/page.tsx`
**Current:** LoadingStars centered
**Needs:**
- Project grid skeleton (6-9 project cards in grid)
- Search/filter bar skeleton
- Header with action button skeleton

#### Project Detail Page
**File:** `apps/web/app/(dashboard)/projects/[slug]/page.tsx`
**Current:** LoadingStars centered
**Needs:**
- Project header skeleton (title, description, stats)
- Tab navigation skeleton
- Stats cards skeleton (4 cards)
- Content area skeleton (varies by tab)

#### Project Edit Page
**File:** `apps/web/app/(dashboard)/projects/[slug]/edit/page.tsx`
**Current:** LoadingStars centered
**Needs:**
- Form skeleton with multiple sections:
  - Basic info fields (3-4 inputs)
  - Branding section (color pickers, logo upload)
  - Settings section (toggles, selects)
  - Action buttons

#### Widget Builder Page (New)
**File:** `apps/web/app/(dashboard)/projects/[slug]/widgets/new/page.tsx`
**Current:** LoadingStars centered
**Needs:**
- Widget form skeleton (left panel)
- Widget preview skeleton (right panel)
- Two-column layout skeleton

#### Widget Edit Page
**File:** `apps/web/app/(dashboard)/projects/[slug]/widgets/[widgetId]/edit/page.tsx`
**Current:** LoadingStars centered
**Needs:**
- Same as Widget Builder (form + preview)

#### Account Settings Page
**File:** `apps/web/app/(dashboard)/account/page.tsx`
**Current:** LoadingStars centered with text
**Needs:**
- Profile section skeleton (avatar, name, email)
- Settings sections skeleton (6 collapsible sections)
- Action buttons skeleton

---

### 2. **Component-Level Loaders** (4 instances)

#### Testimonial List Component
**File:** `apps/web/components/testimonial-list.tsx`
**Current:** LoadingStars with "Loading testimonials..." text
**Needs:**
- Testimonial card skeleton (3-5 cards)
- Filter bar skeleton
- Pagination skeleton
- Moderation mode: Include moderation badges and action buttons

#### Project Widgets Tab
**File:** `apps/web/components/project-detail/project-widgets-tab.tsx`
**Current:** LoadingStars with "Loading widgets..." text
**Needs:**
- Widget card skeleton (2-4 cards in grid)
- Empty state skeleton
- Action button skeleton

#### Widget Builder Component
**File:** `apps/web/components/widgets/widget-builder.tsx`
**Current:** LoadingStars in 400px container
**Needs:**
- Form fields skeleton (left side)
- Preview area skeleton (right side)
- Split-panel layout skeleton

---

## 🎨 Skeleton Loader Components to Create

### 1. **Base Skeleton Components**
**File:** `apps/web/components/ui/skeleton.tsx` (shadcn/ui)

Already exists in shadcn/ui. Need to verify and potentially customize.

### 2. **Composite Skeleton Components**

#### Dashboard Skeletons
**File:** `apps/web/components/skeletons/dashboard-skeleton.tsx`
- `DashboardStatsSkeleton` - 4 stat cards
- `RecentProjectsSkeleton` - Project list
- `QuickActionsSkeleton` - Action buttons

#### Project Skeletons
**File:** `apps/web/components/skeletons/project-skeleton.tsx`
- `ProjectCardSkeleton` - Single project card
- `ProjectGridSkeleton` - Grid of project cards
- `ProjectHeaderSkeleton` - Project detail header
- `ProjectStatsSkeleton` - Stats cards

#### Form Skeletons
**File:** `apps/web/components/skeletons/form-skeleton.tsx`
- `FormFieldSkeleton` - Single form field
- `FormSectionSkeleton` - Section with multiple fields
- `ProjectFormSkeleton` - Complete project form
- `WidgetFormSkeleton` - Widget configuration form

#### Testimonial Skeletons
**File:** `apps/web/components/skeletons/testimonial-skeleton.tsx`
- `TestimonialCardSkeleton` - Single testimonial card
- `TestimonialListSkeleton` - List of testimonial cards
- `ModerationQueueSkeleton` - Moderation view with filters

#### Widget Skeletons
**File:** `apps/web/components/skeletons/widget-skeleton.tsx`
- `WidgetCardSkeleton` - Single widget card
- `WidgetGridSkeleton` - Grid of widget cards
- `WidgetBuilderSkeleton` - Split panel (form + preview)
- `WidgetPreviewSkeleton` - Preview area only

#### Account Skeletons
**File:** `apps/web/components/skeletons/account-skeleton.tsx`
- `ProfileSectionSkeleton` - Profile info
- `SettingsSectionSkeleton` - Settings section
- `AccountSettingsSkeleton` - Complete account page

---

## 🔄 Implementation Strategy

### Phase 1: Setup Base Components (30 min)
1. ✅ Verify shadcn/ui skeleton component exists
2. Create skeleton components directory structure
3. Create base skeleton utilities (pulse animation, shimmer effect)

### Phase 2: Create Composite Skeletons (2-3 hours)
1. Dashboard skeletons
2. Project skeletons
3. Form skeletons
4. Testimonial skeletons
5. Widget skeletons
6. Account skeletons

### Phase 3: Replace LoadingStars (1-2 hours)
1. Replace in pages (7 instances)
2. Replace in components (4 instances)
3. Test each replacement
4. Verify responsive behavior

### Phase 4: Cleanup (30 min)
1. Remove LoadingStars component (keep InlineLoader)
2. Update imports
3. Test all pages
4. Document changes

---

## 📐 Design Guidelines

### Skeleton Appearance
- **Color:** Use `bg-muted` or `bg-muted/50` for skeleton elements
- **Animation:** Pulse animation (opacity 0.5 to 1)
- **Border Radius:** Match actual component (rounded-md, rounded-lg, etc.)
- **Spacing:** Match actual component spacing
- **Height:** Match actual component height or use min-height

### Best Practices
1. **Match Layout:** Skeleton should match the actual component layout
2. **Responsive:** Skeleton should be responsive like the actual component
3. **Accessible:** Include proper ARIA labels
4. **Performance:** Use CSS animations, not JavaScript
5. **Realistic:** Show realistic content structure

### Example Skeleton Pattern
```tsx
<div className="space-y-4">
  <Skeleton className="h-12 w-full" /> {/* Header */}
  <div className="grid grid-cols-3 gap-4">
    <Skeleton className="h-32 w-full" /> {/* Card 1 */}
    <Skeleton className="h-32 w-full" /> {/* Card 2 */}
    <Skeleton className="h-32 w-full" /> {/* Card 3 */}
  </div>
</div>
```

---

## 🎯 Success Criteria

### Functional
- ✅ All LoadingStars instances replaced
- ✅ Skeleton loaders match actual component layouts
- ✅ Responsive behavior works correctly
- ✅ No loading state regressions

### Visual
- ✅ Smooth pulse animation
- ✅ Proper spacing and sizing
- ✅ Consistent styling across all skeletons
- ✅ Professional appearance

### Performance
- ✅ No performance degradation
- ✅ Fast initial render
- ✅ Smooth animations (60fps)

### Accessibility
- ✅ Proper ARIA labels
- ✅ Screen reader friendly
- ✅ Keyboard navigation works

---

## 📊 Component Breakdown

### Priority 1: High-Traffic Pages
1. Dashboard page - Most visited
2. Projects list page - Entry point
3. Project detail page - Core functionality
4. Testimonial list - Core functionality

### Priority 2: Secondary Pages
5. Project edit page
6. Widget builder pages
7. Account settings page

### Priority 3: Components
8. Testimonial list component
9. Widget grid component
10. Widget builder component

---

## 🔧 Technical Details

### Dependencies
- `@workspace/ui/components/skeleton` (shadcn/ui)
- Tailwind CSS for styling
- No additional dependencies needed

### File Structure
```
apps/web/components/skeletons/
├── index.ts                      # Export all skeletons
├── dashboard-skeleton.tsx        # Dashboard skeletons
├── project-skeleton.tsx          # Project skeletons
├── form-skeleton.tsx             # Form skeletons
├── testimonial-skeleton.tsx      # Testimonial skeletons
├── widget-skeleton.tsx           # Widget skeletons
└── account-skeleton.tsx          # Account skeletons
```

### Naming Convention
- Component: `[Feature][Type]Skeleton`
- Example: `ProjectCardSkeleton`, `DashboardStatsSkeleton`
- File: `[feature]-skeleton.tsx`

---

## 📝 Implementation Checklist

### Setup
- [ ] Verify shadcn/ui skeleton component
- [ ] Create skeletons directory
- [ ] Create index.ts for exports

### Create Skeletons
- [ ] Dashboard skeletons (3 components)
- [ ] Project skeletons (4 components)
- [ ] Form skeletons (4 components)
- [ ] Testimonial skeletons (3 components)
- [ ] Widget skeletons (4 components)
- [ ] Account skeletons (3 components)

### Replace LoadingStars
- [ ] Dashboard page
- [ ] Projects list page
- [ ] Project detail page
- [ ] Project edit page
- [ ] Widget new page
- [ ] Widget edit page
- [ ] Account page
- [ ] Testimonial list component
- [ ] Project widgets tab
- [ ] Widget builder component

### Testing
- [ ] Test all pages with skeletons
- [ ] Verify responsive behavior
- [ ] Check accessibility
- [ ] Test loading states
- [ ] Verify animations

### Cleanup
- [ ] Remove LoadingStars component
- [ ] Update imports
- [ ] Remove unused dependencies
- [ ] Update documentation

---

## 🚀 Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Start implementation** - Begin with Phase 1
3. **Iterate** - Create skeletons one by one
4. **Test** - Verify each replacement
5. **Deploy** - Merge to main when complete

---

**Estimated Time:** 4-6 hours total
**Complexity:** Medium
**Impact:** High (Better UX, more professional appearance)

