"use client";

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-muted/30 px-4 py-24 md:px-8 md:py-32">
      <div className="container relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to start collecting testimonials?
        </h2>
        <p className="mb-8 max-w-xl text-lg text-muted-foreground">
          Set up in 2 minutes. No credit card required for the free plan.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="h-11 px-6" asChild>
            <Link href="/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-11 px-6" asChild>
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
