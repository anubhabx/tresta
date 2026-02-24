"use client";

import { useState } from "react";
import { SectionHeader } from "./section-header";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Moon,
  Sun,
  LayoutGrid,
  List,
  Columns,
  GalleryHorizontal,
  Heart,
  Star,
  MoveRight,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Sample testimonials for the interactive demo
 * Using generic but realistic-looking data
 */
const sampleTestimonials = [
  {
    id: 1,
    initials: "JD",
    name: "Jane D.",
    role: "Developer",
    content:
      "Super easy to set up. Had testimonials on my site in under 5 minutes.",
    rating: 5,
    color: "bg-primary",
  },
  {
    id: 2,
    initials: "AS",
    name: "Alex S.",
    role: "Founder",
    content:
      "The widget layouts look great and match our brand perfectly. Love the dark mode!",
    rating: 5,
    color: "bg-success",
  },
  {
    id: 3,
    initials: "MK",
    name: "Maria K.",
    role: "Designer",
    content:
      "Finally a testimonial tool that doesn't look like it's from 2010. Beautiful design.",
    rating: 5,
    color: "bg-warning",
  },
  {
    id: 4,
    initials: "RJ",
    name: "Raj J.",
    role: "Product Manager",
    content:
      "The AI moderation saved us so much time. No more spam testimonials.",
    rating: 4,
    color: "bg-destructive",
  },
];

type LayoutType = "grid" | "list" | "carousel" | "masonry" | "wall" | "marquee";

const layoutOptions: {
  id: LayoutType;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { id: "grid", label: "Grid", icon: LayoutGrid },
  { id: "list", label: "List", icon: List },
  { id: "carousel", label: "Carousel", icon: GalleryHorizontal },
  { id: "masonry", label: "Masonry", icon: Columns },
  { id: "wall", label: "Wall", icon: Heart },
  { id: "marquee", label: "Marquee", icon: MoveRight },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "fill-warning text-warning" : "text-muted",
          )}
        />
      ))}
    </div>
  );
}

export function InteractiveDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [layout, setLayout] = useState<LayoutType>("grid");

  const getGridClasses = () => {
    switch (layout) {
      case "grid":
        return "grid-cols-1 md:grid-cols-2";
      case "list":
        return "grid-cols-1 max-w-2xl mx-auto";
      case "carousel":
        return "grid-cols-1 md:grid-cols-3 overflow-x-auto";
      case "masonry":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "wall":
        return "grid-cols-2 md:grid-cols-4";
      case "marquee":
        return "grid-cols-1 md:grid-cols-3 overflow-x-hidden";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

  return (
    <section className="mx-auto bg-muted/30 px-4 py-24 md:px-8 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <SectionHeader
          title="See it in action"
          description="Choose a layout, toggle themes, and see how your testimonials will look."
        />

        <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/50 p-4">
            {/* Layout Selector */}
            <div className="flex items-center gap-1">
              {layoutOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={layout === option.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLayout(option.id)}
                  className="h-8 gap-1.5"
                >
                  <option.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              ))}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 gap-2"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </Button>
          </div>

          {/* Preview Area */}
          <div
            className="min-h-[400px] p-6 transition-colors duration-300"
            style={{
              backgroundColor: theme === "dark" ? "var(--color-background-dark, #0A0A0A)" : "var(--color-background-light, #FAFAFA)",
              // Scoped preview theme variables
              "--preview-bg": theme === "dark" ? "#141414" : "#ffffff",
              "--preview-border": theme === "dark" ? "#2E2E2E" : "#E5E5E5",
              "--preview-fg": theme === "dark" ? "#FAFAFA" : "#0A0A0A",
              "--preview-muted": theme === "dark" ? "#A3A3A3" : "#737373",
              "--preview-muted-alt": theme === "dark" ? "#737373" : "#A3A3A3",
            } as React.CSSProperties}
          >
            <div className={cn("grid gap-4", getGridClasses())}>
              {sampleTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="transition-all duration-300"
                  style={{
                    borderColor: "var(--preview-border)",
                    backgroundColor: "var(--preview-bg)",
                  }}
                >
                  <CardContent className="p-5">
                    <StarRating rating={testimonial.rating} />
                    <p
                      className="my-4 text-sm"
                      style={{ color: "var(--preview-muted)" }}
                    >
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white",
                          testimonial.color,
                        )}
                      >
                        {testimonial.initials}
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--preview-fg)" }}
                        >
                          {testimonial.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--preview-muted-alt)" }}
                        >
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Call to action */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          All 6 layouts are available in the free plan
        </p>
      </div>
    </section>
  );
}
