"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { CodeBlock } from "@workspace/ui/components/code-block";
import { Copy, Check, ChevronDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const frameworks = [
  { id: "html", label: "HTML" },
  { id: "nextjs", label: "Next.js" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "astro", label: "Astro" },
] as const;

type Framework = (typeof frameworks)[number]["id"];

const codeExamples: Record<Framework, string> = {
  html: `<!-- Add this anywhere in your HTML -->
<script
  src="https://tresta.app/widget.js"
  data-project="your-project-slug"
  data-theme="dark"
  data-layout="carousel"
></script>`,
  nextjs: `// components/Testimonials.tsx
import Script from 'next/script'

export function Testimonials() {
  return (
    <Script
      src="https://tresta.app/widget.js"
      data-project="your-project-slug"
      data-theme="dark"
      data-layout="carousel"
      strategy="lazyOnload"
    />
  )
}`,
  react: `// App.jsx
import { useEffect } from 'react'

function Testimonials() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://tresta.app/widget.js'
    script.dataset.project = 'your-project-slug'
    script.dataset.theme = 'dark'
    script.dataset.layout = 'carousel'
    document.body.appendChild(script)
  }, [])
  
  return <div id="tresta-testimonials" />
}`,
  vue: `<!-- Testimonials.vue -->
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://tresta.app/widget.js'
  script.dataset.project = 'your-project-slug'
  script.dataset.theme = 'dark'
  script.dataset.layout = 'carousel'
  document.body.appendChild(script)
})
</script>

<template>
  <div id="tresta-testimonials" />
</template>`,
  astro: `---
// Testimonials.astro
---
<div id="tresta-testimonials"></div>

<script
  is:inline
  src="https://tresta.app/widget.js"
  data-project="your-project-slug"
  data-theme="dark"
  data-layout="carousel"
></script>`,
};

const configOptions = [
  {
    prop: "data-theme",
    values: '"light" | "dark" | "system"',
    desc: "Theme mode",
  },
  {
    prop: "data-layout",
    values: '"carousel" | "grid" | "wall" | "masonry" | "list"',
    desc: "Display layout",
  },
  { prop: "data-limit", values: "number", desc: "Max testimonials to show" },
  {
    prop: "data-filter-rating",
    values: "number",
    desc: "Minimum rating filter",
  },
];

export function IntegrationSection() {
  const [selectedFramework, setSelectedFramework] = useState<Framework>("html");

  return (
    <section
      id="integration"
      className="container mx-auto px-4 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            One line. That&apos;s it.
          </h2>
          <p className="text-lg text-muted-foreground">
            Works with any framework. No dependencies. No build step.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          {/* Framework Tabs */}
          <div className="flex items-center gap-1 border-b border-border bg-muted/50 p-2">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                onClick={() => setSelectedFramework(fw.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  selectedFramework === fw.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {fw.label}
              </button>
            ))}
          </div>

          {/* Code Block */}
          <div className="p-4">
            <CodeBlock
              code={codeExamples[selectedFramework]}
              language={selectedFramework === "html" ? "html" : "typescript"}
              copyable
              showLineNumbers
            />
          </div>
        </motion.div>

        {/* Config Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Configuration Options
          </h3>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Property
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Values
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {configOptions.map((opt) => (
                  <tr key={opt.prop}>
                    <td className="px-4 py-3">
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 text-sm text-primary font-mono">
                        {opt.prop}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm text-muted-foreground font-mono">
                        {opt.values}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {opt.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
