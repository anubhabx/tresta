# Tresta UI Overhaul Plan

> **Version:** 1.0  
> **Target:** Solo Developer MVP  
> **Scope:** Complete UI rebuild while preserving business logic  
> **Date:** February 2026

---

## Executive Summary

This document consolidates all research findings and outlines a complete UI overhaul for Tresta. The goal is to rebuild the user-facing interface with a cleaner, more developer-focused aesthetic while preserving the existing backend architecture, API routes, and database schema.

**Key Principle:** The business logic stays. The UI gets rebuilt.

---

# Part 1: Research Findings

## 1.1 Competitive Analysis

### Primary Competitors

| Product | Strength | Weakness | Takeaway |
|---------|----------|----------|----------|
| **Senja.io** | Wall of Love, 30+ social imports, video sizzle reels | Overwhelming UI, too many options | Keep feature set focused |
| **Testimonial.to** | Video-first, simple dashboard | Basic design, dated feel | Opportunity to be more polished |
| **Linear** | Minimal chrome, keyboard-first, status systems | Enterprise-focused | Adopt keyboard shortcuts, dense layouts |
| **Vercel Dashboard** | Project cards, one-click actions, env vars as key-value | N/A | Model for developer UX |
| **Supabase Studio** | API docs sidebar, table editor, connection strings | N/A | Model for embed code display |

### Developer Tool Patterns

Developers prefer:
- **Copy-paste code snippets** over drag-and-drop builders
- **API-first documentation** prominently displayed
- **Dense information layouts** over decorative whitespace
- **Keyboard shortcuts** for common actions
- **Dark mode as default**

### "Golden Path" User Flow

Target: **4 steps to value in under 2 minutes**

```
1. Sign up (OAuth) → 2. Create Space → 3. Get testimonial link → 4. Copy embed code
```

Competitor comparison:
- Senja: ~10 minutes to first embed
- Testimonial.to: ~8 minutes to first embed
- **Tresta target:** ~2 minutes to first embed

---

## 1.2 Current State Analysis

### Existing Architecture (Preserved)

| Layer | Technology | Status |
|-------|------------|--------|
| **Frontend Framework** | Next.js 15 (App Router) | ✅ Keep |
| **UI Library** | shadcn/ui (Radix primitives) | ✅ Keep |
| **Styling** | Tailwind CSS 4 | ✅ Keep |
| **Auth** | Clerk (Google OAuth) | ✅ Keep |
| **State** | TanStack Query + Zustand | ✅ Keep |
| **Storage** | Azure Blob Storage | ✅ Keep |
| **Database** | PostgreSQL + Prisma | ✅ Keep |
| **Real-time** | Ably | ✅ Keep |
| **Widget** | Vanilla TS bundle | ✅ Keep |

### Current Codebase Structure

```
tresta/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/      # Sign in/up pages
│   │   │   ├── (dashboard)/ # Dashboard, projects, account
│   │   │   ├── (public)/    # Landing, collect form
│   │   │   └── (standalone)/ # Embed pages
│   │   ├── components/
│   │   │   ├── landing/     # 11 components (hero, features, etc.)
│   │   │   ├── dashboard/   # 9 components (stats, cards, etc.)
│   │   │   ├── widgets/     # Widget builder components
│   │   │   └── ...
│   │   └── lib/             # API client, queries
│   ├── api/                 # Express.js backend
│   └── admin/               # Admin dashboard
├── packages/
│   ├── database/            # Prisma schema
│   ├── ui/                  # Shared UI components (shadcn/ui)
│   ├── widget/              # Embeddable widget bundle
│   └── types/               # Shared TypeScript types
```

### Current UI Issues

| Issue | Location | Severity |
|-------|----------|----------|
| **Vague messaging** | Landing hero ("Turn Customer Love Into Growth") | Critical |
| **Placeholder visuals** | Hero dashboard mockup (empty divs) | Critical |
| **Generic features section** | Feature cards with abstract icons | High |
| **Teal color overuse** | Gradient everywhere, looks generic | Medium |
| **Font mismatch** | Layout uses Figtree, globals define IBM Plex | Medium |
| **Sparse dashboard** | Stats cards minimal, no quick actions | High |
| **Hidden developer features** | No embed code on dashboard, no API docs | High |
| **Dither effect performance** | Canvas animation on hero | Medium |

### Current Design Tokens

```css
/* From packages/ui/src/styles/globals.css */

:root {
  --primary: oklch(0.7124 0.0977 186.6761);  /* Teal - too generic */
  --font-sans: IBM Plex Sans;                 /* Different from layout.tsx */
  --font-serif: "Lora", serif;                /* Unused */
  --radius: 0rem;                             /* Sharp corners - inconsistent */
}

/* From apps/web/app/layout.tsx */
Figtree (sans)
Fira Code (mono)
Lora (serif)
```

---

## 1.3 Feature Inventory

### Existing Features (97% MVP Complete)

| Feature | Status | UI Quality |
|---------|--------|------------|
| **Authentication** | ✅ Complete | Good (Clerk) |
| **Project CRUD** | ✅ Complete | Needs polish |
| **Testimonial Collection** | ✅ Complete | Needs polish |
| **Testimonial Moderation** | ✅ Complete | Good |
| **Auto-moderation (AI)** | ✅ Complete | Good |
| **OAuth Verification** | ✅ Complete | Good |
| **Widget Layouts (5)** | ✅ Complete | Excellent |
| **Widget Builder** | ✅ Complete | Needs overhaul |
| **Account Settings** | ✅ Complete | Good |
| **GDPR Compliance** | ✅ Complete | Good |

### Missing UI Features

| Feature | Priority | Effort |
|---------|----------|--------|
| **Embed code on dashboard** | Critical | Low |
| **API documentation page** | High | Medium |
| **Activity feed** | Medium | Low |
| **Command palette (⌘K)** | Medium | Medium |
| **Social proof on landing** | High | Low |

---

# Part 2: Design System Overhaul

## 2.1 Design Philosophy

### Before: Marketing-First
- Gradients, animations, visual polish
- Decorative elements (dither effect)
- Generic SaaS aesthetic

### After: Developer-First ("Technical Utility")
- Clean, high-contrast interfaces
- Data-dense layouts
- Monospace for code/data
- Copy-first interactions
- Minimal decorative elements

### Reference Products
- **Vercel** — Project cards, deployment logs
- **Supabase** — API docs sidebar, table editor
- **Linear** — Keyboard shortcuts, dense lists
- **Railway** — Service cards, clean typography

---

## 2.2 Color System

### Current (Generic Teal)
```css
--primary: oklch(0.7124 0.0977 186.6761);
```

### Proposed: Monochrome + Single Accent

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#FAFAFA` | `#0A0A0A` | Page background |
| `--foreground` | `#0A0A0A` | `#FAFAFA` | Primary text |
| `--card` | `#FFFFFF` | `#141414` | Card surfaces |
| `--muted` | `#F5F5F5` | `#1F1F1F` | Secondary surfaces |
| `--muted-foreground` | `#737373` | `#A3A3A3` | Secondary text |
| `--border` | `#E5E5E5` | `#2E2E2E` | Borders |
| `--primary` | `#2563EB` | `#3B82F6` | Primary actions |
| `--success` | `#16A34A` | `#22C55E` | Approved status |
| `--warning` | `#D97706` | `#F59E0B` | Pending status |
| `--destructive` | `#DC2626` | `#EF4444` | Rejected, errors |

**Rationale:** Blue is more trustworthy for a developer tool. Teal reads as "trendy marketing app."

---

## 2.3 Typography

### Current
```tsx
// layout.tsx
Figtree (sans) + Lora (serif) + Fira Code (mono)

// globals.css
IBM Plex Sans
```

### Proposed
```tsx
// Unified stack
Inter (UI text) — widely cached, excellent readability
JetBrains Mono (code/data) — developer standard
```

**Remove:** Lora (unused), IBM Plex (conflicting)

### Type Scale

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| `display` | 48px / 56px | 700 | Hero headlines |
| `h1` | 32px / 40px | 600 | Page titles |
| `h2` | 24px / 32px | 600 | Section headers |
| `h3` | 18px / 28px | 600 | Card titles |
| `body` | 16px / 24px | 400 | Paragraphs |
| `body-sm` | 14px / 20px | 400 | Descriptions |
| `caption` | 12px / 16px | 500 | Labels, timestamps |
| `mono` | 14px / 20px | 400 | Code, IDs, data |

---

## 2.4 Spacing & Border Radius

### Current
```css
--radius: 0rem; /* Light mode - sharp */
--radius: 0.25rem; /* Dark mode - rounded */
```

### Proposed
```css
--radius-sm: 4px;   /* Buttons, inputs */
--radius-md: 6px;   /* Cards */
--radius-lg: 8px;   /* Modals, dialogs */
--radius-xl: 12px;  /* Hero elements */
```

**Rationale:** Consistent radius across modes. Slightly rounded feels modern without being bubbly.

---

## 2.5 Component Specifications

### Buttons

| Variant | Background | Border | Hover |
|---------|------------|--------|-------|
| Primary | `--primary` | none | `opacity 0.9` |
| Secondary | transparent | `1px --border` | `bg-muted` |
| Ghost | transparent | none | `bg-muted` |
| Destructive | `--destructive` | none | `opacity 0.9` |

**Sizing:**
- `sm`: 32px height, 12px padding
- `default`: 40px height, 16px padding
- `lg`: 48px height, 24px padding

### Cards

```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: none; /* Flat design */
}

.card:hover {
  border-color: var(--primary);
  transition: border-color 150ms;
}
```

### Code Blocks

```css
.code-block {
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 14px;
  padding: 16px;
  position: relative;
}

.code-block .copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

### Status Badges

| Status | Background | Text |
|--------|------------|------|
| Pending | `--warning/10` | `--warning` |
| Approved | `--success/10` | `--success` |
| Rejected | `--destructive/10` | `--destructive` |
| Verified | `--primary/10` | `--primary` |

---

# Part 3: Page-by-Page Overhaul

## 3.1 Landing Page (`/`)

### Current Structure
```
LandingNavbar
Hero (with Dither effect)
Features
HowItWorks
InteractiveDemo
Pricing
FAQ
CTA
```

### Proposed Overhaul

#### Hero Section — Complete Rebuild

**Current:**
```tsx
<h1>
  Turn Customer Love <br/>
  <span className="gradient">Into Growth</span>
</h1>
<p>The all-in-one platform to collect, manage, and showcase...</p>
```

**Replace with:**
```tsx

**Remove:** Dither canvas effect (performance overhead, adds visual noise)

#### Features Section — Show Real Product

**Current:** Abstract icons with generic descriptions

**Replace with:** Side-by-side product screenshots

```tsx
const features = [
  {
    title: "Branded collection forms",
    description: "Send customers a simple link. They submit feedback in seconds.",
    image: "/feature-collect.png",
    align: "left"
  },
  {
    title: "One-click moderation",
    description: "Approve, reject, or flag testimonials. AI auto-moderates spam.",
    image: "/feature-moderate.png",
    align: "right"
  },
  {
    title: "Embed with one line of code",
    description: "Copy a script tag. Paste it anywhere. Choose from 5 layouts.",
    image: "/feature-embed.png",
    align: "left"
  }
];

{features.map((feature, i) => (
  <section 
    key={i} 
    className={cn(
      "py-24 flex flex-col lg:flex-row items-center gap-12",
      feature.align === "right" && "lg:flex-row-reverse"
    )}
  >
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold">{feature.title}</h2>
      <p className="text-lg text-muted-foreground">{feature.description}</p>
    </div>
    <div className="flex-1">
      <img 
        src={feature.image} 
        alt={feature.title}
        className="rounded-lg border shadow-lg"
      />
    </div>
  </section>
))}
```

#### Pricing Section — Align with Database

**Current:** Starter ($0), Pro ($29)

**Align with `UserPlan` enum and actual limits:**

```tsx
const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Tresta",
    features: [
      "1 project",
      "50 testimonials",
      "Basic widget layouts",
      "Standard moderation",
      "Tresta branding on widgets"
    ],
    cta: "Get Started",
    href: "/sign-up"
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    description: "For growing projects",
    features: [
      "Unlimited projects",
      "Unlimited testimonials",
      "All widget layouts",
      "AI auto-moderation",
      "Remove branding",
      "Priority support",
      "Custom brand colors"
    ],
    cta: "Upgrade to Pro",
    href: "/sign-up?plan=pro",
    popular: true
  }
];
```

---

## 3.2 Dashboard (`/dashboard`)

### Current Structure
- Header with welcome
- Stats cards (3)
- Pending actions
- Recent projects list
- Status overview
- Getting started

### Proposed Overhaul

#### Layout — Denser, More Actionable

```tsx
<div className="grid grid-cols-12 gap-6">
  {/* Left Column - Main Content */}
  <div className="col-span-8 space-y-6">
    {/* Quick Stats Bar */}
    <div className="flex gap-4">
      <StatCard label="Projects" value={projectCount} />
      <StatCard label="Testimonials" value={testimonialCount} />
      <StatCard label="Pending Review" value={pendingCount} badge />
    </div>

    {/* Recent Activity Feed */}
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFeed items={recentTestimonials} />
      </CardContent>
    </Card>

    {/* Projects List */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Projects</CardTitle>
        <Button size="sm" asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ProjectsTable projects={projects} />
      </CardContent>
    </Card>
  </div>

  {/* Right Column - Quick Actions */}
  <div className="col-span-4 space-y-6">
    {/* Embed Code Quick Copy */}
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Quick Embed</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={setSelectedProject}>
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedProject && (
          <CodeBlock 
            code={`<script src="https://tresta.app/w/${selectedProject}.js"></script>`}
            copyable
          />
        )}
      </CardContent>
    </Card>

    {/* Keyboard Shortcuts */}
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>New project</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs">N</kbd>
        </div>
        <div className="flex justify-between">
          <span>Command menu</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
```

#### New Component: Activity Feed

```tsx
// components/dashboard/activity-feed.tsx
interface ActivityItem {
  id: string;
  type: 'testimonial_submitted' | 'testimonial_approved' | 'project_created';
  projectName: string;
  authorName?: string;
  timestamp: Date;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {item.type === 'testimonial_submitted' && <MessageSquare className="h-4 w-4" />}
            {item.type === 'testimonial_approved' && <Check className="h-4 w-4 text-green-500" />}
            {item.type === 'project_created' && <FolderPlus className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              {item.type === 'testimonial_submitted' && (
                <><strong>{item.authorName}</strong> submitted a testimonial to <strong>{item.projectName}</strong></>
              )}
              {/* ... other types */}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 3.3 Project Detail Page (`/projects/[slug]`)

### Current Structure
- Tabs: Overview, Testimonials, Widget, Settings

### Proposed Overhaul

#### Header — Add Quick Embed

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <div className="flex items-center gap-3">
      {project.logoUrl && <Avatar src={project.logoUrl} />}
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-muted-foreground">{project.shortDescription}</p>
      </div>
    </div>
  </div>
  
  {/* Quick Actions */}
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" onClick={copyCollectionLink}>
      <Link2 className="mr-2 h-4 w-4" />
      Copy Collection Link
    </Button>
    <Button size="sm" onClick={openEmbedDialog}>
      <Code className="mr-2 h-4 w-4" />
      Get Embed Code
    </Button>
  </div>
</div>
```

#### Embed Code Dialog — Prominent and Easy

```tsx
// components/project-detail/embed-dialog.tsx
<Dialog>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Embed on your website</DialogTitle>
      <DialogDescription>
        Copy one of these snippets to display testimonials on your site.
      </DialogDescription>
    </DialogHeader>
    
    <Tabs defaultValue="script">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="script">Script Tag</TabsTrigger>
        <TabsTrigger value="iframe">iframe</TabsTrigger>
        <TabsTrigger value="react">React</TabsTrigger>
      </TabsList>
      
      <TabsContent value="script" className="mt-4">
        <CodeBlock 
          language="html"
          code={`<!-- Add this to your HTML -->
<div id="tresta-widget"></div>
<script 
  src="https://tresta.app/widget.js" 
  data-project="${project.slug}"
  data-layout="carousel"
></script>`}
          copyable
        />
      </TabsContent>
      
      <TabsContent value="iframe" className="mt-4">
        <CodeBlock 
          language="html"
          code={`<iframe 
  src="https://tresta.app/embed/${project.slug}?layout=carousel"
  width="100%" 
  height="400"
  frameborder="0"
></iframe>`}
          copyable
        />
      </TabsContent>
      
      <TabsContent value="react" className="mt-4">
        <CodeBlock 
          language="tsx"
          code={`import { TrestaWidget } from '@tresta/react';

function App() {
  return (
    <TrestaWidget 
      project="${project.slug}"
      layout="carousel"
    />
  );
}`}
          copyable
        />
        <p className="text-sm text-muted-foreground mt-2">
          Install: <code className="bg-muted px-1 rounded">npm install @tresta/react</code>
        </p>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

---

## 3.4 Widget Builder (`/projects/[slug]?tab=widget`)

### Proposed Overhaul

#### Layout Selector — Visual Thumbnails

```tsx
const layouts = [
  { id: 'carousel', label: 'Carousel', icon: Carousel },
  { id: 'grid', label: 'Grid', icon: LayoutGrid },
  { id: 'masonry', label: 'Masonry', icon: Columns },
  { id: 'wall', label: 'Wall of Love', icon: Heart },
  { id: 'list', label: 'List', icon: List },
];

<div className="grid grid-cols-5 gap-3">
  {layouts.map(layout => (
    <button
      key={layout.id}
      onClick={() => setLayout(layout.id)}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
        activeLayout === layout.id 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50"
      )}
    >
      <layout.icon className="h-8 w-8" />
      <span className="text-sm font-medium">{layout.label}</span>
    </button>
  ))}
</div>
```

#### Settings Panel — Grouped and Clear

```tsx
<div className="space-y-6">
  {/* Display Options */}
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      Display
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <Label className="flex items-center gap-2">
        <Switch checked={showRating} onCheckedChange={setShowRating} />
        Show ratings
      </Label>
      <Label className="flex items-center gap-2">
        <Switch checked={showDate} onCheckedChange={setShowDate} />
        Show dates
      </Label>
      <Label className="flex items-center gap-2">
        <Switch checked={showAvatar} onCheckedChange={setShowAvatar} />
        Show avatars
      </Label>
      <Label className="flex items-center gap-2">
        <Switch checked={showVerified} onCheckedChange={setShowVerified} />
        Verified badges
      </Label>
    </div>
  </div>
  
  {/* Appearance */}
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      Appearance
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Theme</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="auto">Auto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Accent Color</Label>
        <ColorPicker value={accentColor} onChange={setAccentColor} />
      </div>
    </div>
  </div>
</div>
```

---

## 3.5 Collection Form (`/collect/[slug]`)

### Proposed Overhaul

#### Cleaner Layout

```tsx
<div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
  <Card className="w-full max-w-lg">
    <CardHeader className="text-center">
      {project.logoUrl && (
        <Avatar src={project.logoUrl} className="h-16 w-16 mx-auto mb-4" />
      )}
      <CardTitle className="text-2xl">Share your experience</CardTitle>
      <CardDescription>
        Tell us about your experience with {project.name}
      </CardDescription>
    </CardHeader>
    
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem className="text-center">
                <FormLabel>How would you rate us?</FormLabel>
                <FormControl>
                  <StarRating value={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Testimonial */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your testimonial</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What did you like? How did it help you?"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <FormField name="authorName" /* ... */ />
            <FormField name="authorEmail" /* ... */ />
          </div>
          
          {/* Google OAuth Option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          <Button type="button" variant="outline" className="w-full">
            <GoogleIcon className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          
          <Button type="submit" className="w-full">
            Submit Testimonial
          </Button>
        </form>
      </Form>
    </CardContent>
  </Card>
</div>
```

#### Success State

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="text-center py-12"
>
  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
    <Check className="h-8 w-8 text-green-600" />
  </div>
  <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
  <p className="text-muted-foreground mb-6">
    Your testimonial has been submitted and is pending review.
  </p>
  <Button variant="outline" asChild>
    <Link href={project.websiteUrl || "/"}>
      Visit {project.name}
    </Link>
  </Button>
</motion.div>
```

---

## 3.6 New Page: API Documentation (`/docs`)

```tsx
// app/(public)/docs/page.tsx

export default function DocsPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
      <p className="text-muted-foreground mb-8">
        Fetch testimonials programmatically using our REST API.
      </p>
      
      <div className="space-y-12">
        {/* Authentication */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <p className="mb-4">
            All API requests require an API key. Get yours from the{" "}
            <Link href="/dashboard/settings" className="text-primary underline">
              settings page
            </Link>.
          </p>
          <CodeBlock
            language="bash"
            code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://tresta.app/api/v1/projects/your-project/testimonials`}
          />
        </section>
        
        {/* Endpoints */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Endpoints</h2>
          
          <div className="border rounded-lg divide-y">
            <EndpointDoc
              method="GET"
              path="/api/v1/projects/:slug/testimonials"
              description="List all approved testimonials for a project"
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/testimonials/:id"
              description="Get a single testimonial by ID"
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/projects/:slug/testimonials"
              description="Submit a new testimonial (no auth required)"
            />
          </div>
        </section>
        
        {/* Response Format */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Response Format</h2>
          <CodeBlock
            language="json"
            code={`{
  "testimonials": [
    {
      "id": "clp1234567890",
      "content": "Amazing product! Highly recommend.",
      "authorName": "Jane Doe",
      "authorTitle": "Product Manager",
      "rating": 5,
      "isOAuthVerified": true,
      "createdAt": "2026-02-01T12:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10
  }
}`}
          />
        </section>
      </div>
    </div>
  );
}
```

---

# Part 4: Implementation Checklist

## Phase 1: Design System Update (1-2 days)
- [ ] Update [globals.css](file:///c:/workspace/tresta/packages/ui/src/styles/globals.css) with new color tokens
- [ ] Update typography (Inter + JetBrains Mono)
- [ ] Update border radius values
- [ ] Update [layout.tsx](file:///c:/workspace/tresta/apps/web/app/layout.tsx) font imports
- [ ] Create `CodeBlock` component with copy button

## Phase 2: Landing Page Rebuild (2-3 days)
- [ ] Rebuild Hero section (new copy, remove Dither)
- [ ] Capture product screenshots for visuals
- [ ] Rebuild Features section with screenshots
- [ ] Update Pricing to match actual plans
- [ ] Add social proof numbers
- [ ] Remove unused components (SocialProof, Testimonials if using own widget)

## Phase 3: Dashboard Overhaul (2-3 days)
- [ ] Implement new dashboard layout (2-column)
- [ ] Create ActivityFeed component
- [ ] Add Quick Embed card
- [ ] Improve stats cards
- [ ] Add keyboard shortcuts card
- [ ] Improve empty states

## Phase 4: Project Detail Improvements (1-2 days)
- [ ] Add embed code to header
- [ ] Create EmbedDialog component
- [ ] Show collection link prominently
- [ ] Add mini stats to project header

## Phase 5: Widget Builder Polish (1-2 days)
- [ ] Visual layout selector
- [ ] Grouped settings panels
- [ ] Better preview controls

## Phase 6: Collection Form (1 day)
- [ ] Cleaner layout
- [ ] Success state animation
- [ ] Optional social sharing

## Phase 7: New Pages (1 day)
- [ ] API Documentation page
- [ ] Command palette (⌘K)

---

# Part 5: User Decisions Required

> [!IMPORTANT]
> Please confirm the following before implementation:

1. **Color Palette:** Approve switch from Teal to Blue accent?
-> Approved.
2. **Typography:** Approve Inter + JetBrains Mono?
-> Approved.
3. **Hero Copy:** "Collect testimonials. Embed them anywhere."?
-> Change the tone and presentation.
4. **Pricing:** Align with $5/month Pro tier or different pricing?
-> Keep it affordable. With the target audience being Indian devs.
5. **Priority:** Which phase to start first?
-> Build Phase by Phase, no compromises with quality of code/features. Nothing should be half baked. Move on to next phase only when all checklists are ticked.
6. **Screenshots:** Shall I use placeholder designs or capture from current app?
-> Capture if possible, otherwise ask me for the ones you cannot.

---

*Overhaul Plan v1.0 — Complete UI Rebuild*
