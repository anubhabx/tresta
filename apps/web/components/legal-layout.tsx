"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Home, List, X } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  toc: TocItem[];
}

// ─── Table of Contents Navigation ────────────────────────────────────────────

function TocNav({
  items,
  activeId,
  onItemClick,
}: {
  items: TocItem[];
  activeId: string;
  onItemClick?: () => void;
}) {
  return (
    <nav aria-label="Table of contents">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  const y =
                    el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
                onItemClick?.();
              }}
              className={cn(
                "block rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                item.level === 3 && "pl-6",
                activeId === item.id
                  ? "bg-zinc-800/60 text-zinc-100 font-medium"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── Intersection Observer Hook ──────────────────────────────────────────────

function useActiveSection(ids: string[]): string {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;

    // Clean up previous observer
    observerRef.current?.disconnect();

    const callback: IntersectionObserverCallback = (entries) => {
      // Find the first entry that is intersecting (top-most visible section)
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top
        );

      if (visibleEntries.length > 0) {
        setActiveId(visibleEntries[0]!.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    // Set initial active section
    if (!activeId && ids[0]) {
      setActiveId(ids[0]);
    }

    return () => observerRef.current?.disconnect();
  }, [ids]); // eslint-disable-line react-hooks/exhaustive-deps

  return activeId;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function LegalLayout({
  title,
  lastUpdated,
  children,
  toc,
}: LegalLayoutProps) {
  const tocIds = toc.map((item) => item.id);
  const activeId = useActiveSection(tocIds);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* ── Trust Header ─────────────────────────────────────────────── */}
      <div className="border-b border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-sm"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            <span className="text-zinc-400">{title}</span>
          </nav>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            {title}
          </h1>

          {/* Last Updated Badge */}
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-mono text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Last updated: {lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile ToC Trigger ───────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-zinc-800/60 bg-background/80 backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="my-2 gap-2 text-zinc-400 hover:text-zinc-200"
              >
                <List className="h-4 w-4" />
                On this page
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-zinc-950 border-zinc-800 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
                  <SheetTitle className="text-sm font-semibold text-zinc-300">
                    On this page
                  </SheetTitle>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <TocNav
                    items={toc}
                    activeId={activeId}
                    onItemClick={() => setMobileOpen(false)}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Two-Column Layout ────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 xl:grid-cols-[240px_1fr] xl:gap-16">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 -ml-1 pt-10 pb-16">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                On this page
              </p>
              <TocNav items={toc} activeId={activeId} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 max-w-3xl py-10 pb-20">
            <article className="legal-prose">{children}</article>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Section Helper ──────────────────────────────────────────────────────────

/** Wraps a legal section with a proper ID anchor for the ToC. */
export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** Sub-section for h3-level headings */
export function LegalSubSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
