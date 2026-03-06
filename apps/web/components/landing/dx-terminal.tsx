"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldHalf, Zap, Terminal } from "lucide-react";

// ─── Code content for each tab ───────────────────────────────────────────────

function HtmlCode() {
  return (
    <pre className="font-mono text-sm leading-[1.9] text-zinc-300 overflow-x-auto">
      <code className="block">
        <span className="text-zinc-500">
          {"<!-- 1. Add the lightweight script to your <head> -->"}
        </span>
        {"\n"}
        <span className="text-pink-400">{"<script "}</span>
        <span className="text-emerald-400">src</span>
        <span className="text-amber-300">
          {"='https://cdn.tresta.dev/widget.js'"}
        </span>
        <span className="text-pink-400">{"defer></script>"}</span>
        {"\n\n"}
        <span className="text-zinc-500">
          {"<!-- 2. Drop the target div anywhere in your UI -->"}
        </span>
        {"\n"}
        <span className="text-sky-400">{"<div"}</span>
        {"\n"}
        {"  "}
        <span className="text-emerald-400">data-tresta-widget</span>
        <span className="text-amber-300">{"='my-project-id'"}</span>
        {"\n"}
        {"  "}
        <span className="text-emerald-400">data-layout</span>
        <span className="text-amber-300">{"='masonry'"}</span>
        {"\n"}
        {"  "}
        <span className="text-emerald-400">data-theme</span>
        <span className="text-amber-300">{"='dark'"}</span>
        {"\n"}
        <span className="text-sky-400">{">"}</span>
        <span className="text-sky-400">{"</div>"}</span>
        {"\n"}
        <span className="text-zinc-600">{"// That's it. Seriously."}</span>
        <span className="inline-block w-[2px] h-[1em] bg-primary/80 ml-1 align-middle animate-[blink_1.1s_step-end_infinite]" />
      </code>
    </pre>
  );
}

function ReactCode() {
  return (
    <pre className="font-mono text-sm leading-[1.9] text-zinc-300 overflow-x-auto">
      <code className="block">
        <span className="text-zinc-500">{"// App.tsx — React hook usage"}</span>
        {"\n"}
        <span className="text-pink-400">import </span>
        <span className="text-sky-300">{"{ useTresta }"}</span>
        <span className="text-pink-400">{" from "}</span>
        <span className="text-amber-300">{"'@tresta/react'"}</span>
        {"\n\n"}
        <span className="text-pink-400">export default function </span>
        <span className="text-yellow-300">{"TestimonialsPage"}</span>
        <span className="text-zinc-300">{"() {"}</span>
        {"\n"}
        {"  "}
        <span className="text-pink-400">const </span>
        <span className="text-sky-300">{"{ widget }"}</span>
        <span className="text-zinc-300">{" = "}</span>
        <span className="text-yellow-300">useTresta</span>
        <span className="text-zinc-300">{"({"}</span>
        {"\n"}
        {"    "}
        <span className="text-emerald-400">projectId</span>
        <span className="text-zinc-300">{": "}</span>
        <span className="text-amber-300">{"'my-project-id'"}</span>
        <span className="text-zinc-300">{","}</span>
        {"\n"}
        {"    "}
        <span className="text-emerald-400">layout</span>
        <span className="text-zinc-300">{": "}</span>
        <span className="text-amber-300">{"'masonry'"}</span>
        <span className="text-zinc-300">{","}</span>
        {"\n"}
        {"    "}
        <span className="text-emerald-400">theme</span>
        <span className="text-zinc-300">{": "}</span>
        <span className="text-amber-300">{"'dark'"}</span>
        <span className="text-zinc-300">{","}</span>
        {"\n"}
        {"  "}
        <span className="text-zinc-300">{"});"}</span>
        {"\n\n"}
        {"  "}
        <span className="text-pink-400">return </span>
        <span className="text-sky-400">{"<widget.Widget "}</span>
        <span className="text-emerald-400">className</span>
        <span className="text-zinc-300">{"="}</span>
        <span className="text-amber-300">{"'my-section'"}</span>
        <span className="text-sky-400">{" />"}</span>
        {"\n"}
        <span className="text-zinc-300">{"}"}</span>
        <span className="inline-block w-[2px] h-[1em] bg-primary/80 ml-1 align-middle animate-[blink_1.1s_step-end_infinite]" />
      </code>
    </pre>
  );
}

// ─── Stat chip ───────────────────────────────────────────────────────────────

function StatChip({
  icon,
  label,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="flex items-center space-x-2 text-zinc-300 bg-zinc-900/60 backdrop-blur border border-white/8 py-2 px-4 rounded-md"
    >
      {icon}
      <span className="font-mono text-sm">{label}</span>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type Tab = "html" | "react";

export function DxTerminal() {
  const [activeTab, setActiveTab] = useState<Tab>("html");

  return (
    <section className="py-32 relative bg-background border-y border-white/5 overflow-hidden">
      {/* Subtle ambient glow — reduced opacity so it doesn't dominate */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] opacity-[0.07] pointer-events-none">
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center justify-center p-3 bg-zinc-900 border border-zinc-800 rounded-lg mb-4 shadow-[0_0_20px_rgba(255,255,255,0.04)]">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-medium text-white">
            Built for the modern web.
          </h2>
          <p className="text-zinc-400 font-sans max-w-2xl mx-auto text-lg leading-relaxed">
            A developer experience that gets out of your way. Drop one script
            tag anywhere and unleash the full power of interactive widgets.
          </p>
        </motion.div>

        {/* Stat chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-16">
          <StatChip
            icon={<Zap className="w-4 h-4 text-yellow-500" />}
            label="42kb Size (IIFE)"
            delay={0}
          />
          <StatChip
            icon={<ShieldHalf className="w-4 h-4 text-emerald-500" />}
            label="Strict CSP Ready"
            delay={0.08}
          />
          <StatChip
            icon={
              <div className="w-4 h-4 bg-primary text-white text-[9px] font-bold rounded flex items-center justify-center leading-none">
                AA
              </div>
            }
            label="WCAG 2.1 Compliant"
            delay={0.16}
          />
        </div>

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-3xl bg-[#0d0d0d] rounded-lg border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* IDE title bar */}
          <div className="bg-[#161616] border-b border-white/8 px-4 py-3 flex items-center gap-4">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Tabs — centered */}
            <div className="flex-1 flex items-center justify-center gap-1">
              {(["html", "react"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative px-4 py-1.5 text-xs font-mono transition-colors"
                >
                  <span
                    className={
                      activeTab === tab
                        ? "text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-300"
                    }
                  >
                    {tab === "html" ? "index.html" : "App.tsx"}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-md border-t-2 border-primary"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Spacer to balance traffic lights */}
            <div className="shrink-0 w-[54px]" />
          </div>

          {/* Code body with fade transition between tabs */}
          <div className="p-6 md:p-8 min-h-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {activeTab === "html" ? <HtmlCode /> : <ReactCode />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
