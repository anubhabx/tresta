# Tresta Brand System

_Last updated: November 27, 2025_

This guide replaces the placeholder GitHub logo and establishes a lightweight, implementation-ready identity for the Tresta platform across marketing surfaces, dashboards, and embeds.

---

## 1. Brand Foundation

| Attribute        | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| **Personality**  | Confident, trustworthy, product-focused, and quietly opinionated             |
| **Tone of voice**| Clear, instructive sentences with active verbs and minimal jargon            |
| **Design goals** | Highlight authentic voices, keep UI calm, emphasize action states with color |

**Narrative hook:** “Tresta captures real customer voice and makes it effortless to publish.” Reference testimonials, stars, and dialogue motifs whenever illustration is needed.

---

## 2. Logo System

### 2.1 Logomark

- **File:** `apps/web/public/branding/tresta-logomark.svg`
- **Concept:** Overlapping dialogue tiles with a central guiding star → “curated testimonials”.
- **Safe zone:** Maintain clear space equal to the width of the inner dark tile on all sides.
- **Minimum sizes:** 24 px (UI icons), 64 px (marketing). Do not place on busy photos without a monochrome knock-out.

### 2.2 Wordmark & Lockups

Use the existing UI font stack for the wordmark so it remains consistent with in-product typography.

```
font-family: "Geist", "Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif;
letter-spacing: -0.01em;
font-weight: 600;
```

Guidelines:
- Default lockup: logomark to the left of the word “Tresta” with 0.75× mark width spacing.
- Monochrome usage: set both mark and text to `#F4F7FF` on dark backgrounds or `#101828` on light backgrounds.
- Widget embeds should use the logomark-only treatment to minimize footprint.

---

## 3. Color Palette

| Token                | Hex      | OKLCH (L C H°)     | Usage                                                           |
| -------------------- | -------- | ------------------ | --------------------------------------------------------------- |
| `--color-primary`    | `#335CFF`| `0.63 0.20 252.4`  | Primary CTA buttons, active states, logomark gradient start     |
| `--color-accent`     | `#7C9BFF`| `0.79 0.08 252.4`  | Gradient end, hover fills, subtle outlines                      |
| `--color-teal`       | `#2FD4C5`| `0.79 0.08 180.6`  | Success pills, verification badges                              |
| `--color-amber`      | `#F5A524`| `0.79 0.11 78.3`   | Warning states, toast accents                                   |
| `--color-slate-950`  | `#0B1120`| `0.23 0.05 255.0`  | App background, modals, secondary logomark tile                 |
| `--color-slate-900`  | `#111828`| `0.27 0.04 255.0`  | Panels, cards                                                    |
| `--color-slate-200`  | `#E2E8F0`| `0.87 0.03 255.0`  | Dividers, subtle borders                                        |
| `--color-foam`       | `#F4F7FF`| `0.95 0.01 252.0`  | Text on dark backgrounds, highlight chips                       |

Implementation snippet:

```css
:root {
  --color-primary: #335cff;
  --color-primary-muted: #7c9bff;
  --color-teal: #2fd4c5;
  --color-amber: #f5a524;
  --color-bg: #0b1120;
  --color-panel: #111828;
  --color-border: #e2e8f0;
  --color-foam: #f4f7ff;
}
```

---

## 4. Typography

| Context            | Typeface                  | Notes                                                      |
| ------------------ | ------------------------- | ---------------------------------------------------------- |
| Product UI         | Geist Sans (already in app)| Retain existing usage for consistency                     |
| Marketing headlines| **Sora** (600/700 weights) | Geometric display font with friendly curves               |
| Long-form copy     | Inter / system sans        | Improves readability for docs and emails                   |

Webfont reference:

```css
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap");

.marketing-h1 {
  font-family: "Sora", "Geist", "Inter", sans-serif;
  letter-spacing: -0.02em;
}
```

Maintain sentence-case headings, concise body copy, and avoid centered paragraphs except in hero treatments.

---

## 5. Iconography & Illustration

- Icons: Continue using Lucide to align with existing UI. Stroke weight 1.5 px, rounded joins.
- Illustration motifs: chat tiles, stars, checkmarks, subtle gradients using the primary palette.
- Avoid mascots or skeuomorphic elements; favor abstract geometric forms that can scale down well.

---

## 6. UI & Widget Application

### 6.1 Elevated Surfaces

Use layered cards with a subtle inner border:

```css
.card {
  background: radial-gradient(circle at top, rgba(51,92,255,0.12), transparent 55%), var(--color-panel);
  border: 1px solid rgba(244,247,255,0.08);
  box-shadow: 0 10px 30px rgba(12,18,32,0.45);
}
```

### 6.2 Buttons

- Primary buttons: solid `--color-primary` background, white text, 4 px corner radius.
- Secondary buttons: `#1D2435` fill, `--color-primary` text, 1 px `rgba(124,155,255,0.4)` border.
- Focus ring: 2 px `rgba(47,212,197,0.4)` inset + 1 px `rgba(51,92,255,0.7)` outset to reinforce accessibility work.

### 6.3 Widget Embed Rules

1. Display the logomark at 20 px height above the testimonial list or inside the footer watermark.
2. Use the provided palette for CSS variables `--tresta-accent` and `--tresta-bg` so host sites inherit consistent colors.
3. Keep the watermark text `Powered by Tresta` in `#F4F7FF` at 70% opacity on dark backgrounds or `#0B1120` at 60% on light backgrounds.

---

## 7. Asset Checklist

| Asset                           | Path                                                   | Notes                                      |
| --------------------------------| ------------------------------------------------------ | ------------------------------------------ |
| Logomark (SVG)                  | `apps/web/public/branding/tresta-logomark.svg`         | Use everywhere a square icon is required   |
| Wordmark (generated via font)   | N/A (rendered text)                                    | Typeset “Tresta” with rules in §2.2        |
| Favicon recommendation          | Convert logomark to 32×32 ICO/PNG via build script     | Update `apps/web/public/favicon.*`         |
| Widget watermark                | Use logomark + `Powered by Tresta` string             | Reference `packages/widget/src/renderer.ts`|

---

## 8. Next Steps

1. Swap the placeholder GitHub logo with `tresta-logomark.svg` in all Next.js layouts (header, sidebar, Clerk sign-in screen).
2. Update widget demo pages (`packages/widget/*.html`) to reference the new asset and palette tokens.
3. Create PNG exports (128 px, 512 px) for marketing decks once the favicon pipeline is updated.

This document serves as the single source of truth until a full design system site is produced.
