# Mobile-First Development Guidelines

Quick reference for maintaining mobile-first responsive design in the application.

## Core Principles

### 1. Mobile-First Approach
Always write base styles for mobile, then enhance for larger screens:

```tsx
// ✅ Good - Mobile first
<div className="p-3 sm:p-4 lg:p-6">

// ❌ Bad - Desktop first
<div className="p-6 sm:p-4 mobile:p-3">
```

### 2. Touch Targets
All interactive elements should be at least 44x44px on mobile:

```tsx
// ✅ Good
<Button className="touch-manipulation min-h-[44px] sm:min-h-0">

// ❌ Bad
<Button className="h-8">
```

### 3. Responsive Typography
Scale text progressively:

```tsx
// ✅ Good
<h1 className="text-xl sm:text-2xl lg:text-3xl">

// ❌ Bad
<h1 className="text-3xl">
```

## Common Patterns

### Layout Patterns

#### Stack to Row
```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
```

#### Grid Columns
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
```

#### Full Width to Auto
```tsx
<Button className="w-full sm:w-auto">
```

### Spacing Patterns

#### Padding
```tsx
<div className="p-3 sm:p-4 lg:p-6">
```

#### Gap
```tsx
<div className="gap-3 sm:gap-4 lg:gap-6">
```

#### Margin
```tsx
<div className="mb-2 sm:mb-3 lg:mb-4">
```

### Content Patterns

#### Hide/Show Content
```tsx
// Show only on mobile
<span className="sm:hidden">Mobile</span>

// Hide on mobile
<span className="hidden sm:inline">Desktop</span>
```

#### Icon vs Text
```tsx
<Button>
  <Icon className="h-4 w-4 sm:mr-2" />
  <span className="hidden sm:inline">Label</span>
</Button>
```

#### Line Clamping
```tsx
<p className="line-clamp-2 sm:line-clamp-none">
```

### Complex Data Patterns

#### Mobile Cards, Desktop Table
```tsx
{/* Mobile */}
<div className="md:hidden">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>

{/* Desktop */}
<div className="hidden md:block">
  <Table>...</Table>
</div>
```

#### Horizontal Scroll with Indicators
```tsx
<div className="relative">
  <div className="overflow-x-auto pb-2 no-scrollbar snap-x">
    {/* Content */}
  </div>
  <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background sm:hidden" />
</div>
```

## Breakpoint Reference

```
xs:  < 640px   (mobile)
sm:  ≥ 640px   (large mobile)
md:  ≥ 768px   (tablet)
lg:  ≥ 1024px  (desktop)
xl:  ≥ 1280px  (large desktop)
2xl: ≥ 1536px  (extra large)
```

## Checklist for New Components

- [ ] Base styles work on mobile (< 640px)
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable without zooming
- [ ] No unintended horizontal scroll
- [ ] Spacing scales appropriately
- [ ] Images/media are responsive
- [ ] Forms are easy to use on mobile
- [ ] Navigation is accessible
- [ ] Test on actual devices if possible

## Common Mistakes to Avoid

### ❌ Don't Do This

```tsx
// Fixed widths
<div className="w-[800px]">

// Desktop-first breakpoints
<div className="lg:p-6 md:p-4 sm:p-2">

// Tiny touch targets
<button className="h-6 w-6">

// Overflow without handling
<div className="flex gap-2">
  {manyItems.map(...)}
</div>

// Truncate long URLs
<code className="truncate">{longUrl}</code>
```

### ✅ Do This Instead

```tsx
// Responsive widths
<div className="w-full max-w-7xl mx-auto">

// Mobile-first breakpoints
<div className="p-2 sm:p-4 lg:p-6">

// Proper touch targets
<button className="h-12 w-12 sm:h-8 sm:w-8">

// Handle overflow
<div className="flex gap-2 overflow-x-auto">
  {manyItems.map(...)}
</div>

// Break long URLs
<code className="break-all">{longUrl}</code>
```

## Testing Tips

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test these viewports:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1280px)

### Quick Test Command
```bash
# If you have a dev server running
# Open in mobile view: http://localhost:3000
```

### Real Device Testing
- Test on at least one iOS device
- Test on at least one Android device
- Test in both portrait and landscape
- Test with different font sizes

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Web.dev Mobile UX](https://web.dev/mobile-ux/)
