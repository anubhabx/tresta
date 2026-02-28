"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CodeBlock } from "@workspace/ui/components/code-block";
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
  src="https://api.tresta.app/widget/tresta-widget.js"
  data-tresta-widget="your-widget-id"
  data-api-key="your-api-key"
></script>`,
  nextjs: `// components/Testimonials.tsx
import Script from 'next/script'

export function Testimonials() {
  return (
    <Script
      src="https://api.tresta.app/widget/tresta-widget.js"
      data-tresta-widget="your-widget-id"
      data-api-key="your-api-key"
      strategy="lazyOnload"
    />
  )
}`,
  react: `// App.jsx
import { useEffect } from 'react'

function Testimonials() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://api.tresta.app/widget/tresta-widget.js'
    script.setAttribute('data-tresta-widget', 'your-widget-id')
    script.setAttribute('data-api-key', 'your-api-key')
    document.body.appendChild(script)
  }, [])
  
  return <div id="tresta-testimonials" />
}`,
  vue: `<!-- Testimonials.vue -->
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://api.tresta.app/widget/tresta-widget.js'
  script.setAttribute('data-tresta-widget', 'your-widget-id')
  script.setAttribute('data-api-key', 'your-api-key')
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
  src="https://api.tresta.app/widget/tresta-widget.js"
  data-tresta-widget="your-widget-id"
  data-api-key="your-api-key"
></script>`,
};

const configOptions = [
  {
    prop: "data-tresta-widget",
    values: "string",
    desc: "Your widget ID",
  },
  {
    prop: "data-api-key",
    values: "string",
    desc: "Your API key",
  },
  {
    prop: "data-api-url",
    values: "string",
    desc: "API base URL (optional)",
  },
  {
    prop: "data-theme",
    values: '"light" | "dark" | "system"',
    desc: "Theme mode",
  },
];

export function IntegrationSection() {
  const [selectedFramework, setSelectedFramework] = useState<Framework>("html");
  const reducedMotion = useReducedMotion();
  const reduced = !!reducedMotion;

  return (
    <section
      id="integration"
      className="bg-[#08090d] px-4 py-24 md:px-8 md:py-32"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#e8eaed] sm:text-4xl">
            One line. That&apos;s it.
          </h2>
          <p className="text-lg text-[#8b8f99]">
            Works with any framework. No dependencies. No build step.
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="rounded-xl border border-[#2a2e38] bg-[#111318] overflow-hidden"
        >
          {/* Framework Tabs */}
          <div className="flex items-center gap-1 border-b border-[#2a2e38] bg-[#0c0e12] p-2">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                onClick={() => setSelectedFramework(fw.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  selectedFramework === fw.id
                    ? "bg-[#60a5fa]/10 text-[#60a5fa]"
                    : "text-[#8b8f99] hover:text-[#e8eaed]",
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
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8b8f99]">
            Configuration Options
          </h3>
          <div className="rounded-lg border border-[#2a2e38] bg-[#111318] overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-[#2a2e38] bg-[#0c0e12]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8b8f99]">
                    Property
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8b8f99]">
                    Values
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#8b8f99] hidden sm:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e38]">
                {configOptions.map((opt) => (
                  <tr key={opt.prop}>
                    <td className="px-4 py-3">
                      <code className="rounded bg-[#60a5fa]/10 px-1.5 py-0.5 text-sm text-[#60a5fa] font-mono">
                        {opt.prop}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm text-[#8b8f99] font-mono">
                        {opt.values}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8b8f99] hidden sm:table-cell">
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
