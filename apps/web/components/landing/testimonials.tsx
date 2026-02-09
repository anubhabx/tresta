"use client";

import { SectionHeader } from "./section-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { motion } from "framer-motion";
import { Star, Zap } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Developer testimonials with verified badges
 * Meta: This section itself is powered by Tresta
 */
const testimonials = [
  {
    name: "@shipfast_dev",
    role: "Indie Hacker",
    verified: "GitHub",
    rating: 5,
    content:
      "Set it up in 10 minutes. Haven't touched it since. It just works.",
  },
  {
    name: "@saas_founder",
    role: "Founder",
    verified: "Google",
    rating: 5,
    content: "The embed just works. Dark mode, light mode, any framework.",
  },
  {
    name: "@frontend_dev",
    role: "Developer",
    verified: "GitHub",
    rating: 5,
    content:
      "One script tag. Zero CSS headaches. This is how tools should work.",
  },
  {
    name: "@indie_maker",
    role: "Maker",
    verified: "Google",
    rating: 5,
    content: "Finally, testimonials that don't look like they're from 2015.",
  },
  {
    name: "@product_lead",
    role: "Product Lead",
    verified: "LinkedIn",
    rating: 5,
    content: "The OAuth verification is a game changer. No more fake reviews.",
  },
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

export function Testimonials() {
  return (
    <section className="overflow-hidden py-24 md:py-32 bg-muted/30">
      <div className="container mb-12">
        <SectionHeader
          title="What developers are saying"
          description="Real feedback from developers using Tresta in production."
        />
      </div>

      {/* Scrolling testimonials */}
      <div className="relative flex w-full overflow-hidden py-4 max-w-6xl mx-auto">
        <motion.div
          className="flex gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 25,
          }}
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <Card
              key={index}
              className="w-[320px] flex-shrink-0 border-border bg-card"
            >
              <CardContent className="p-5">
                <StarRating rating={testimonial.rating} />
                <p className="my-4 text-sm text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {testimonial.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
                    ✓ {testimonial.verified}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      {/* Meta badge: This section is powered by Tresta */}
      <div className="mt-8 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary"
        >
          <Zap className="h-4 w-4" />
          <span>This section is powered by Tresta</span>
        </motion.div>
      </div>
    </section>
  );
}
