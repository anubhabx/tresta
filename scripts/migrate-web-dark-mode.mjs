/**
 * Task 15 — Add dark-mode variants to web components.
 *
 * Replaces hardcoded zinc-* colors with semantic design tokens
 * in apps/web components that are missing dual-theme support.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname, relative } from "path";

const WEB_SRC = join(process.cwd(), "apps", "web");

// Only operate on the specific files identified in the audit
const TARGET_FILES = [
  "components/ui/bento-grid.tsx",
  "components/landing/spotlight-card.tsx",
  "components/landing/features.tsx",
  "components/landing/pain-section.tsx",
  "components/account-settings/api-key-card.tsx",
  "components/legal-layout.tsx",
  "components/account-settings/sidebar-nav.tsx",
  "app/(public)/privacy-policy/page.tsx",
  "app/(auth)/layout.tsx",
  "components/landing/canvas-reveal-effect.tsx",
];

const REPLACEMENTS = [
  // === Compound patterns (most specific first) ===

  // Card/container: border + bg compounds
  [
    /border-zinc-800\s+bg-zinc-900/g,
    "border-border bg-card",
  ],
  [
    /border-zinc-700\/50\s+bg-zinc-950/g,
    "border-border bg-card",
  ],
  [
    /border-zinc-700\/50\s+bg-zinc-800/g,
    "border-border bg-muted",
  ],
  [
    /bg-zinc-900\/50\s+/g,
    "bg-muted ",
  ],

  // Hover border patterns
  [/hover:border-zinc-700/g, "hover:border-border/80"],

  // Active ToC: bg + text
  [
    /bg-zinc-800\/60\s+text-zinc-100/g,
    "bg-accent text-accent-foreground",
  ],
  // Inactive ToC: text + hover
  [
    /text-zinc-500\s+hover:text-zinc-300\s+hover:bg-zinc-800\/30/g,
    "text-muted-foreground hover:text-foreground hover:bg-accent",
  ],
  [
    /text-zinc-500\s+hover:text-zinc-300/g,
    "text-muted-foreground hover:text-foreground",
  ],
  [
    /text-zinc-400\s+hover:text-zinc-200/g,
    "text-muted-foreground hover:text-foreground",
  ],

  // API key card: bg + border + hover compound
  [
    /bg-zinc-900\s+border\s+border-zinc-800\s+hover:border-zinc-700/g,
    "bg-card border border-border hover:border-border/80",
  ],

  // Copy button: text + hover
  [
    /text-zinc-400\s+hover:text-white/g,
    "text-muted-foreground hover:text-foreground",
  ],

  // Code block compounds: border + bg + text
  [
    /border-zinc-700\s+bg-zinc-800\/50\s+text-zinc-500/g,
    "border-border bg-muted text-muted-foreground",
  ],
  [
    /border-zinc-700\s+bg-zinc-800\s+text-zinc-400/g,
    "border-border bg-muted text-muted-foreground",
  ],

  // Legal layout: border + bg + text
  [
    /border-zinc-800\s+bg-zinc-900\/50\s+text-zinc-400/g,
    "border-border bg-muted text-muted-foreground",
  ],
  [
    /bg-zinc-950\s+border-zinc-800/g,
    "bg-background border-border",
  ],

  // Sidebar active tab
  [
    /bg-zinc-800\s+text-white/g,
    "bg-accent text-accent-foreground",
  ],

  // Privacy button (light-only)
  [
    /bg-white\s+text-zinc-900\s+hover:bg-zinc-200/g,
    "bg-primary text-primary-foreground hover:bg-primary/90",
  ],

  // Pain section code previews
  [
    /bg-zinc-800\/60\s+text-zinc-500/g,
    "bg-muted text-muted-foreground",
  ],
  [
    /bg-zinc-800\/50\s+text-zinc-500/g,
    "bg-muted text-muted-foreground",
  ],

  // === Simple patterns ===

  // Backgrounds
  [/(?<=["' ])bg-zinc-950(?=["' ])/g, "bg-background"],
  [/(?<=["' ])bg-zinc-900\/40(?=["' ])/g, "bg-muted"],
  [/(?<=["' ])bg-zinc-900\/50(?=["' ])/g, "bg-muted"],

  // Borders
  [/border-b\s+border-zinc-800/g, "border-b border-border"],
  [/border-zinc-800\/60/g, "border-border"],
  [/(?<=["' ])border-zinc-800(?=["' ])/g, "border-border"],

  // Text colors
  [/(?<=["' ])text-zinc-100(?=["' ])/g, "text-foreground"],
  [/(?<=["' ])text-zinc-300(?=["' ])/g, "text-foreground"],
  [/(?<=["' ])text-zinc-400(?=["' ])/g, "text-muted-foreground"],
  [/(?<=["' ])text-zinc-500(?=["' ])/g, "text-muted-foreground"],
  [/(?<=["' ])text-zinc-600(?=["' ])/g, "text-muted-foreground"],
  [/(?<=["' ])text-zinc-900(?=["' ])/g, "text-foreground"],

  // Auth layout fallback
  [/(?<=["' ])bg-zinc-950(?=["' ])/g, "bg-background"],
  // Canvas reveal default
  [/(?<=["' ])bg-white(?=["' ])/g, "bg-background"],
];

let totalChanges = 0;
const changedFiles = [];

for (const relPath of TARGET_FILES) {
  const filePath = join(WEB_SRC, relPath);
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    console.log(`  ⚠ ${relPath} — file not found, skipping`);
    continue;
  }

  const original = content;

  for (const [pattern, replacement] of REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    writeFileSync(filePath, content, "utf-8");
    const count =
      original.split("\n").filter((l, i) => l !== content.split("\n")[i])
        .length || 1;
    // count replacements more accurately
    let changes = 0;
    const origLines = original.split("\n");
    const newLines = content.split("\n");
    for (let i = 0; i < Math.max(origLines.length, newLines.length); i++) {
      if (origLines[i] !== newLines[i]) changes++;
    }
    totalChanges += changes;
    changedFiles.push(`  ✓ ${relPath} (${changes} lines changed)`);
  }
}

console.log(changedFiles.join("\n"));
console.log(`\nDone: ${totalChanges} line changes across ${changedFiles.length} files`);
