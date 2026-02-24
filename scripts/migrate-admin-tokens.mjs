/**
 * Migrate raw gray-* / bg-white Tailwind utilities to semantic design tokens
 * in apps/admin/src. Excludes widget-preview.tsx, widget-configurator.tsx,
 * and components/ui/*.
 *
 * Usage: node scripts/migrate-admin-tokens.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";

const ADMIN_SRC = join(process.cwd(), "apps", "admin", "src");

// Files to exclude from migration
const EXCLUDE_PATTERNS = [
  /components[\\/]ui[\\/]/,
  /widget-preview\.tsx$/,
  /widget-configurator\.tsx$/,
];

/**
 * Ordered replacements — order matters! Longer/more specific patterns first.
 * Each entry: [search, replacement]
 */
const REPLACEMENTS = [
  // === Compound patterns (most specific first) ===

  // Select/input with border + bg-white + text-gray + dark: variants (split across or same line)
  [
    /border-gray-300\s+dark:border-gray-600\s+bg-white\s+dark:bg-gray-700\s+text-gray-900\s+dark:text-gray-100/g,
    "border-border bg-background text-foreground",
  ],
  [
    /border-gray-300\s+bg-white\s+text-gray-900\s+dark:border-gray-600\s+dark:bg-gray-700\s+dark:text-gray-100/g,
    "border-border bg-background text-foreground",
  ],
  [
    /border-gray-300\s+dark:border-gray-600\s+bg-white\s+dark:bg-gray-900\s+text-gray-900\s+dark:text-gray-100/g,
    "border-border bg-background text-foreground",
  ],
  // Billing select: border-border already done, but bg-white + text-gray + dark: remain
  [
    /bg-white\s+px-3\s+py-2\s+text-sm\s+text-gray-900\s+focus:outline-none\s+focus:ring-2\s+focus:ring-blue-500\s+dark:border-gray-600\s+dark:bg-gray-700\s+dark:text-gray-100/g,
    "bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary",
  ],

  // Close button pattern
  [
    /text-gray-400\s+hover:text-gray-600\s+dark:hover:text-gray-300/g,
    "text-muted-foreground hover:text-foreground",
  ],

  // Modal close: text-muted-foreground hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300
  [
    /text-muted-foreground\s+hover:text-gray-700\s+dark:text-gray-400\s+dark:hover:text-gray-300/g,
    "text-muted-foreground hover:text-foreground",
  ],

  // Tab inactive: text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100
  [
    /text-muted-foreground\s+hover:text-gray-900\s+dark:hover:text-gray-100/g,
    "text-muted-foreground hover:text-foreground",
  ],

  // Hover + bg combo for buttons/rows
  [
    /bg-white\s+dark:bg-gray-700\s+border-gray-300\s+dark:border-gray-600\s+hover:bg-gray-50\s+dark:hover:bg-gray-600/g,
    "bg-card border-border hover:bg-muted",
  ],
  [
    /bg-white\s+dark:bg-gray-800\s+border-gray-300\s+dark:border-gray-700\s+hover:bg-gray-50\s+dark:hover:bg-gray-700/g,
    "bg-card border-border hover:bg-muted",
  ],

  // Table body: bg + divide
  [
    /bg-white\s+dark:bg-gray-800\s+divide-y\s+divide-gray-200\s+dark:divide-gray-700/g,
    "bg-card divide-y divide-border",
  ],

  // Card combo: bg + border
  [
    /bg-white\s+dark:bg-gray-800\s+border-gray-300\s+dark:border-gray-700/g,
    "bg-card border-border",
  ],

  // Alert button combo
  [
    /bg-white\s+dark:bg-gray-800\s+text-gray-700\s+dark:text-gray-300\s+border-gray-300\s+dark:border-gray-600\s+hover:bg-gray-50\s+dark:hover:bg-gray-600/g,
    "bg-card text-muted-foreground border-border hover:bg-muted",
  ],

  // Embed code: bg + text + border compound
  [
    /bg-white\s+dark:bg-gray-800\s+text-gray-700\s+dark:text-gray-300\s+border-gray-300\s+dark:border-gray-600/g,
    "bg-card text-muted-foreground border-border",
  ],

  // Performance alert muted bg + border
  [
    /border-gray-200\s+dark:border-gray-700\s+bg-gray-50\s+dark:bg-gray-900\/50/g,
    "border-border bg-muted",
  ],

  // Health check dim bg + text
  [
    /bg-gray-100\s+dark:bg-gray-700\s+text-gray-800\s+dark:text-gray-200/g,
    "bg-muted text-muted-foreground",
  ],

  // Widget selector: bg-gray-50 dark:bg-gray-700 ... hover:bg-gray-100 dark:hover:bg-gray-600
  [
    /bg-gray-50\s+dark:bg-gray-700\s+rounded-lg\s+hover:bg-gray-100\s+dark:hover:bg-gray-600/g,
    "bg-muted rounded-lg hover:bg-accent",
  ],

  // Stroke patterns (charts)
  [/stroke-gray-200\s+dark:stroke-gray-700/g, "stroke-border"],

  // Code block patterns (intentionally dark — keep bg-gray-900 text-gray-100)
  // DO NOT MATCH: bg-gray-900 text-gray-100 in embed code blocks

  // Slider / range input
  [
    /bg-gray-200\s+rounded-lg\s+appearance-none\s+cursor-pointer\s+dark:bg-gray-700/g,
    "bg-muted rounded-lg appearance-none cursor-pointer",
  ],

  // Redundant dark: after token already set
  [/text-muted-foreground\s+dark:text-gray-500/g, "text-muted-foreground"],
  [/text-muted-foreground\s+dark:text-gray-400/g, "text-muted-foreground"],

  // bg-gray-100 dark:bg-gray-800 (code inline)
  [/bg-gray-100\s+dark:bg-gray-800/g, "bg-muted"],

  // === Simple paired patterns ===

  // Backgrounds
  [/bg-white\s+dark:bg-gray-800/g, "bg-card"],
  [/bg-white\s+dark:bg-gray-900/g, "bg-card"],
  [/bg-white\s+dark:bg-gray-700/g, "bg-background"],
  [/bg-gray-50\s+dark:bg-gray-950/g, "bg-background"],
  [/bg-gray-50\s+dark:bg-gray-900/g, "bg-muted"],
  [/bg-gray-50\s+dark:bg-gray-800/g, "bg-muted"],
  [/bg-gray-200\s+dark:bg-gray-700/g, "bg-muted"],

  // Standalone bg-white + dark: pattern (bg-white ... dark:bg-gray-800 with stuff between)
  [/bg-white\s+(p-\d+\s+shadow)\s+dark:bg-gray-800/g, "bg-card $1"],

  // Text colors
  [/text-gray-900\s+dark:text-gray-100/g, "text-foreground"],
  [/text-gray-600\s+dark:text-gray-400/g, "text-muted-foreground"],
  [/text-gray-500\s+dark:text-gray-400/g, "text-muted-foreground"],
  [/text-gray-700\s+dark:text-gray-300/g, "text-muted-foreground"],
  [/text-gray-500\s+dark:text-gray-300/g, "text-muted-foreground"],
  [/text-gray-100\s+(?!dark:)/g, "text-foreground "], // in embed code preview — keep

  // Borders
  [/border-gray-200\s+dark:border-gray-700/g, "border-border"],
  [/border-gray-200\s+dark:border-gray-800/g, "border-border"],
  [/border-gray-300\s+dark:border-gray-600/g, "border-border"],
  [/border-gray-300\s+dark:border-gray-700/g, "border-border"],
  [/border-gray-200\b(?!\s+dark:)/g, "border-border"],
  [/border-gray-300\b(?!\s+dark:)/g, "border-border"],

  // Standalone dark:border-gray-*
  [/dark:border-gray-800/g, ""],
  [/dark:border-gray-600/g, ""],
  [/dark:bg-gray-900/g, ""],

  // Divide
  [/divide-gray-200\s+dark:divide-gray-700/g, "divide-border"],

  // Hovers
  [/hover:bg-gray-50\s+dark:hover:bg-gray-700/g, "hover:bg-muted"],
  [/hover:bg-gray-50\s+dark:hover:bg-gray-600/g, "hover:bg-muted"],
  [/hover:bg-gray-100\s+dark:hover:bg-gray-800/g, "hover:bg-accent"],

  // Placeholder
  [
    /placeholder-gray-500\s+dark:placeholder-gray-400/g,
    "placeholder-muted-foreground",
  ],

  // Standalone text-gray-400 (careful: only in className context, not hover:)
  [/(?<=["' ])text-gray-400(?=["' ])/g, "text-muted-foreground"],
  [/(?<=["' ])text-gray-500(?=["' ])/g, "text-muted-foreground"],
];

/**
 * Sidebar-specific replacements (only for sidebar.tsx)
 */
const SIDEBAR_REPLACEMENTS = [
  [/bg-gray-900(?=["' ])/g, "bg-sidebar"],
  [/border-gray-800(?=["' ])/g, "border-sidebar-border"],
  [/bg-gray-800(?=["' ])/g, "bg-sidebar-accent"],
  [
    /text-gray-400\s+hover:bg-gray-800\s+hover:text-white/g,
    "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
  ],
  // Partial migration leftover: text-gray-400 hover:bg-sidebar-accent hover:text-white
  [
    /text-gray-400\s+hover:bg-sidebar-accent\s+hover:text-white/g,
    "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
  ],
  [/(?<=["' ])text-gray-400(?=["' ])/g, "text-sidebar-foreground/70"],
  [/(?<=["' ])text-gray-500(?=["' ])/g, "text-sidebar-foreground/50"],
  [/(?<=["' ])text-white(?=["' ])/g, "text-sidebar-foreground"],
];

function getAllFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...getAllFiles(full));
    } else if ([".tsx", ".ts"].includes(extname(full))) {
      results.push(full);
    }
  }
  return results;
}

function shouldExclude(filePath) {
  const rel = relative(ADMIN_SRC, filePath);
  return EXCLUDE_PATTERNS.some((p) => p.test(rel));
}

let totalChanges = 0;
const changedFiles = [];

for (const filePath of getAllFiles(ADMIN_SRC)) {
  if (shouldExclude(filePath)) continue;

  const original = readFileSync(filePath, "utf-8");
  let content = original;

  const rel = relative(process.cwd(), filePath).replace(/\\/g, "/");
  const isSidebar = rel.includes("sidebar.tsx");

  const replacements = isSidebar ? SIDEBAR_REPLACEMENTS : REPLACEMENTS;

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    writeFileSync(filePath, content, "utf-8");
    const changes = countDiffs(original, content);
    totalChanges += changes;
    changedFiles.push({ file: rel, changes });
    console.log(`  ✓ ${rel} (${changes} replacements)`);
  }
}

console.log(`\nDone: ${totalChanges} replacements across ${changedFiles.length} files`);

function countDiffs(a, b) {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  let diffs = 0;
  for (let i = 0; i < Math.max(linesA.length, linesB.length); i++) {
    if (linesA[i] !== linesB[i]) diffs++;
  }
  return diffs;
}
