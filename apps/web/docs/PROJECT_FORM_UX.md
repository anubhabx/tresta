# Project Form UX: The Project Wizard

> A comprehensive guide to the redesigned Project Creation & Settings experience, inspired by Vercel, Linear, and Typeform.

---

## 1. Overview

The Project Wizard transforms the traditional vertical form into an immersive **Split-View** experience that feels like setting up a repository in GitHub or a deployment in Vercel.

### Design Philosophy

- **Instant Feedback**: Users see changes in real-time
- **Smart Defaults**: Reduce friction with auto-generated values
- **Graceful Paywalls**: Premium features are visible but gently gated
- **Progressive Disclosure**: Advanced options are tucked away but accessible

---

## 2. Split-View Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Project Wizard Header                        │
│   [← Back]              Create New Project                [Skip →]   │
├───────────────────────────────┬─────────────────────────────────────┤
│                               │                                     │
│     CONFIGURATION PANEL       │         LIVE PREVIEW PANEL          │
│        (Left Column)          │          (Right Column)             │
│                               │                                     │
│  ┌─────────────────────────┐  │  ┌─────────────────────────────┐    │
│  │ 🎯 Project Identity     │  │  │                             │    │
│  │ ├─ Name + Auto-Slug     │  │  │                             │    │
│  │ ├─ Emoji Icon Picker    │  │  │    Testimonial Widget       │    │
│  │ └─ Industry Preset      │  │  │         Preview             │    │
│  └─────────────────────────┘  │  │                             │    │
│                               │  │    (Updates in real-time    │    │
│  ┌─────────────────────────┐  │  │     as user configures)     │    │
│  │ 🎨 Theme & Branding     │  │  │                             │    │
│  │ ├─ Theme Selector       │  │  │                             │    │
│  │ ├─ Primary Color        │  │  └─────────────────────────────┘    │
│  │ └─ Logo Upload          │  │                                     │
│  └─────────────────────────┘  │  ┌─────────────────────────────┐    │
│                               │  │  Preview Mode Toggle:       │    │
│  ┌─────────────────────────┐  │  │  [Widget] [Wall] [Form]     │    │
│  │ ⚙️ Advanced (Accordion) │  │  └─────────────────────────────┘    │
│  │ ├─ Custom Domain (PRO)  │  │                                     │
│  │ ├─ Remove Branding(PRO) │  │                                     │
│  │ └─ API Configuration    │  │                                     │
│  └─────────────────────────┘  │                                     │
│                               │                                     │
│     [Create Project →]        │                                     │
└───────────────────────────────┴─────────────────────────────────────┘
```

### Responsive Behavior

| Breakpoint          | Layout                                 |
| ------------------- | -------------------------------------- |
| Desktop (≥1024px)   | Side-by-side split-view, 45/55 ratio   |
| Tablet (768-1023px) | Stacked with collapsible preview       |
| Mobile (<768px)     | Single column, preview as modal/drawer |

---

## 3. Smart Defaults System

### 3.1 Auto-Generated Project Slug

As the user types the project name, the slug updates in real-time below the input field.

```
┌────────────────────────────────────────┐
│  Project Name                          │
│  ┌──────────────────────────────────┐  │
│  │ My SaaS Dashboard                │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Your project URL:                     │
│  tresta.co/p/my-saas-dashboard    ✓    │
│  (auto-generated from name)            │
└────────────────────────────────────────┘
```

**Implementation Notes:**

- Use the existing `generateSlug()` utility from `project-schema.ts`
- Track if user has manually edited the slug
- If user edits slug, stop auto-updating but keep validation

### 3.2 Random Emoji Icon Assignment

When creating a project, if the user doesn't upload a logo:

1. Auto-assign a random industry-appropriate emoji
2. Generate a background gradient from a curated palette

```typescript
// Emoji pools by industry preset
const INDUSTRY_EMOJIS = {
  SAAS: ["🚀", "⚡", "💡", "🔮", "🎯", "📊"],
  ECOMMERCE: ["🛍️", "🛒", "💎", "🎁", "✨", "🏪"],
  AGENCY: ["🎨", "✏️", "🖼️", "💼", "🏢", "📐"],
  OTHER: ["⭐", "🌟", "💫", "🔥", "🌈", "🎪"],
};

// Gradient presets
const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
];
```

### 3.3 Industry Presets (Framework Presets Pattern)

Inspired by Vercel's framework presets, display card-based industry selection:

```
┌──────────────────────────────────────────────────────────────┐
│  What type of project is this?                               │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │   🚀    │  │   🛍️    │  │   🎨    │  │   ✳️    │         │
│  │  SaaS   │  │E-commerce│  │ Agency  │  │  Other  │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
│                                                              │
│  This helps us suggest relevant settings and templates.     │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Graceful Paywall Patterns

### 4.1 The "Locked Toggle" Pattern

For binary premium features like "Remove Branding":

```
┌────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  Remove "Powered by Tresta" branding                 │  │
│  │  Hide the attribution from your widgets              │  │
│  │                                                      │  │
│  │           ┌─────────────────────────────┐            │  │
│  │           │  🔒 ○────────────────       │ (grayed)   │  │
│  │           └─────────────────────────────┘            │  │
│  │                                                      │  │
│  │  [PRO] Upgrade to unlock  ℹ️                         │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Visual States:**

| State                | Toggle                           | Badge            | Tooltip                             |
| -------------------- | -------------------------------- | ---------------- | ----------------------------------- |
| Free User (disabled) | `opacity-50`, cursor-not-allowed | 🔒 + `PRO` badge | "Upgrade to Pro to remove branding" |
| Pro User             | Fully interactive                | None             | None                                |
| Free User (hover)    | Slight highlight                 | Badge pulses     | Tooltip appears                     |

### 4.2 The "Teaser Dropdown" Pattern

For selection-based premium features like "Premium Themes":

```
┌─────────────────────────────────────────────────────────┐
│  Theme                                                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Light Mode                              ▼        │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ✓  Light Mode                                    │  │
│  │     Dark Mode                                     │  │
│  │     Auto (System)                                 │  │
│  │  ─────────────────────────────────────────────    │  │
│  │     Dark Minimal                        [PRO]     │  │
│  │     Glassmorphism                       [PRO]     │  │
│  │     Neon Glow                           [PRO]     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Behavior on Selection of Premium Theme:**

1. Theme IS selected (not blocked)
2. Preview updates immediately (Typeform "Try-Before-You-Buy" pattern)
3. Warning banner appears below:

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  "Dark Minimal" requires Pro to publish.           │
│      Your widget will use the default theme until      │
│      you upgrade. [Upgrade Now]                        │
└─────────────────────────────────────────────────────────┘
```

4. On **Publish/Save**: Hard gate with modal comparison

---

## 5. Real-Time Preview System

### 5.1 Preview Panel Architecture

Leverage the existing `WidgetPreview` component infrastructure:

```typescript
interface ProjectPreviewProps {
  projectName: string;
  projectSlug: string;
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  logo?: string;
  emojiIcon?: string;
  gradient?: string;
  removeBranding: boolean;
  isPro: boolean;
}
```

### 5.2 Preview Modes

The preview panel should support multiple "views":

| Mode                | Shows                                               |
| ------------------- | --------------------------------------------------- |
| **Widget**          | A sample testimonial widget with the selected theme |
| **Wall**            | Wall of Love layout preview                         |
| **Collection Form** | The testimonial collection form appearance          |

```
┌─────────────────────────────────────────┐
│  Preview                                │
│  ┌────────┐ ┌────────┐ ┌────────────┐   │
│  │ Widget │ │  Wall  │ │ Collection │   │
│  └────────┘ └────────┘ └────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │   [Live Preview Content]        │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  💡 Preview updates as you configure    │
└─────────────────────────────────────────┘
```

---

## 6. Component Structure

### Proposed File Structure

```
components/
├── project-wizard/
│   ├── index.tsx                    # Main wizard container
│   ├── project-wizard-header.tsx    # Navigation header
│   ├── project-wizard-preview.tsx   # Right panel preview
│   ├── sections/
│   │   ├── identity-section.tsx     # Name, slug, emoji, preset
│   │   ├── branding-section.tsx     # Theme, colors, logo
│   │   └── advanced-section.tsx     # Accordion with pro features
│   └── components/
│       ├── emoji-picker.tsx         # Emoji icon selector
│       ├── industry-preset-cards.tsx # Card-based preset selector
│       └── theme-selector.tsx       # Theme dropdown with PRO badges
```

---

## 7. Accessibility Considerations

| Element         | Requirement                                    |
| --------------- | ---------------------------------------------- |
| Locked toggles  | `aria-disabled="true"`, clear focus indication |
| PRO badges      | Tooltip on hover AND focus for keyboard users  |
| Preview panel   | `aria-live="polite"` for update announcements  |
| Color pickers   | Keyboard accessible, contrast validated        |
| Form validation | Inline errors with `aria-describedby`          |

---

## 8. Animation & Polish

### Micro-interactions

1. **Slug Generation**: Character-by-character animation as slug updates
2. **Preview Updates**: Crossfade transition (300ms)
3. **Locked Toggle Hover**: Gentle shake + tooltip fade-in
4. **PRO Badge**: Subtle scale-up on hover (1.05)
5. **Theme Selection**: Card border glow animation

### Transitions

```css
.preview-panel {
  transition: all 0.3s ease-in-out;
}

.locked-toggle:hover {
  animation: gentle-shake 0.3s ease-in-out;
}

@keyframes gentle-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}
```

---

## 9. Implementation Priority

### Phase 1: Foundation

1. Split-view layout container
2. Migrate existing form sections to left panel
3. Integrate WidgetPreview into right panel

### Phase 2: Smart Defaults

1. Enhanced slug auto-generation with URL preview
2. Emoji picker component
3. Industry preset card selector

### Phase 3: Graceful Paywalls

1. Implement `LockedToggle` component
2. Implement `ProBadge` component
3. Add premium theme indication to dropdown
4. Warning banner system

### Phase 4: Polish

1. Micro-animations
2. Mobile responsive behavior
3. Accessibility audit
4. Loading states

---

## 10. Reference Implementations

| Platform     | Pattern Learned                                                              |
| ------------ | ---------------------------------------------------------------------------- |
| **Vercel**   | Framework presets → Industry presets, auto-detection, collapsible accordions |
| **Linear**   | Emoji icons for identity, auto-generated identifiers, Inter typography       |
| **Typeform** | Try-before-you-buy for premium themes, publish-time hard gates               |
