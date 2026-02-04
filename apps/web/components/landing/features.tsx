"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { SectionHeader } from "./section-header";
import { motion } from "framer-motion";
import {
  Check,
  Code,
  Link2,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Primary features with side-by-side layout and visual demonstrations
 * These are the key value propositions shown prominently
 */
const primaryFeatures = [
  {
    title: "Branded collection forms",
    description:
      "Send customers a simple link. They submit feedback in seconds. No account required for submitters.",
    align: "left" as const,
    visual: "collection-form",
  },
  {
    title: "One-click moderation",
    description:
      "Approve, reject, or flag testimonials. AI auto-moderates spam and inappropriate content.",
    align: "right" as const,
    visual: "moderation",
  },
  {
    title: "Embed with one line of code",
    description:
      "Copy a script tag. Paste it anywhere. Choose from 5 layouts: carousel, grid, masonry, wall, or list.",
    align: "left" as const,
    visual: "embed-code",
  },
];

/**
 * Secondary features displayed in a compact grid
 */
const secondaryFeatures = [
  {
    title: "OAuth Verification",
    description: "Verify testimonial authors with Google OAuth for authentic social proof.",
    icon: Shield,
  },
  {
    title: "5 Widget Layouts",
    description: "Carousel, grid, masonry, wall of love, and list views ready to embed.",
    icon: Sparkles,
  },
  {
    title: "Any Framework",
    description: "Works with React, Vue, Svelte, vanilla JS, WordPress, Webflow, and more.",
    icon: Code,
  },
  {
    title: "GDPR Compliant",
    description: "Built-in consent management and data handling that respects privacy.",
    icon: Check,
  },
];

/**
 * Visual preview component for collection form feature
 */
function CollectionFormVisual() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-medium text-foreground">Share your experience</div>
          <div className="text-sm text-muted-foreground">with Acme Inc</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("h-6 w-6", i < 4 ? "fill-warning text-warning" : "text-muted")} />
          ))}
        </div>
        <div className="h-20 rounded-md border border-border bg-muted/50 p-3">
          <div className="h-3 w-3/4 rounded bg-foreground/10" />
          <div className="mt-2 h-3 w-1/2 rounded bg-foreground/10" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-9 rounded-md border border-border bg-muted/50" />
          <div className="h-9 rounded-md border border-border bg-muted/50" />
        </div>
        <div className="h-10 rounded-md bg-primary" />
      </div>
    </div>
  );
}

/**
 * Visual preview component for moderation feature
 */
function ModerationVisual() {
  const testimonials = [
    { status: "approved", author: "Jane D.", text: "Amazing product!" },
    { status: "pending", author: "John S.", text: "Really helped our team..." },
    { status: "rejected", author: "Bot", text: "Buy cheap watches..." },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Review Queue</span>
        <span className="text-xs text-muted-foreground">3 items</span>
      </div>
      <div className="space-y-2">
        {testimonials.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3"
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                item.status === "approved" && "bg-success",
                item.status === "pending" && "bg-warning",
                item.status === "rejected" && "bg-destructive"
              )}
            />
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm text-foreground">{item.text}</div>
              <div className="text-xs text-muted-foreground">{item.author}</div>
            </div>
            {item.status === "pending" && (
              <div className="flex gap-1">
                <button className="rounded bg-success/10 px-2 py-1 text-xs text-success hover:bg-success/20">
                  ✓
                </button>
                <button className="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20">
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Visual preview component for embed code feature
 */
function EmbedCodeVisual() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm">
        <div className="text-muted-foreground">&lt;script</div>
        <div className="pl-4">
          <span className="text-primary">src</span>=
          <span className="text-success">&quot;tresta.app/widget.js&quot;</span>
        </div>
        <div className="pl-4">
          <span className="text-primary">data-project</span>=
          <span className="text-success">&quot;acme&quot;</span>
        </div>
        <div className="text-muted-foreground">&gt;&lt;/script&gt;</div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link2 className="h-3 w-3" />
        <span>Works on any website</span>
      </div>
    </div>
  );
}

function FeatureVisual({ type }: { type: string }) {
  switch (type) {
    case "collection-form":
      return <CollectionFormVisual />;
    case "moderation":
      return <ModerationVisual />;
    case "embed-code":
      return <EmbedCodeVisual />;
    default:
      return null;
  }
}

export function Features() {
  return (
    <section className="container mx-auto px-4 py-24 md:px-8 md:py-32">
      <SectionHeader
        title="Built for developers who ship fast"
        description="Everything you need to collect, moderate, and display testimonials. No complexity, no bloat."
      />

      {/* Primary Features - Side by Side */}
      <div className="space-y-24 lg:space-y-32">
        {primaryFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className={cn(
              "flex flex-col items-center gap-8 lg:gap-16",
              feature.align === "left" ? "lg:flex-row" : "lg:flex-row-reverse"
            )}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-foreground lg:text-3xl">
                {feature.title}
              </h3>
              <p className="text-lg text-muted-foreground">
                {feature.description}
              </p>
            </div>

            {/* Visual */}
            <div className="w-full max-w-md flex-1">
              <FeatureVisual type={feature.visual} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Features - Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-24 lg:mt-32"
      >
        <h3 className="mb-8 text-center text-xl font-semibold text-foreground">
          Plus everything else you need
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {secondaryFeatures.map((feature, index) => (
            <Card
              key={index}
              className="border-border bg-card transition-colors hover:border-primary/50"
            >
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
