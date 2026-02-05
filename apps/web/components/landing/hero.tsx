"use client";

import { Button } from "@workspace/ui/components/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code2, MessageSquareQuote, Star, Zap } from "lucide-react";
import { CodeBlock } from "@workspace/ui/components/code-block";

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-background px-4 py-24 md:px-8 md:py-32">
      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Zap className="h-4 w-4" />
              <span>Built for developers</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Collect testimonials.
              <br />
              <span className="text-primary">Embed them anywhere.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 max-w-lg text-lg text-muted-foreground"
            >
              Share a link. Collect feedback. Copy one line of code. Display
              beautiful testimonials on your site in under 2 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" className="h-11 px-6" asChild>
                <Link href="/sign-up">
                  Start collecting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                <Link href="#how-it-works">
                  <Code2 className="mr-2 h-4 w-4" />
                  See how it works
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right Column - Code Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className="relative"
          >
            {/* Testimonial Card Preview */}
            <div className="relative rounded-lg border border-border bg-card p-6 shadow-lg">
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  <MessageSquareQuote className="h-3 w-3" />
                  Preview
                </span>
              </div>

              {/* Sample Testimonial */}
              <div className="mt-4 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-warning text-warning"
                    />
                  ))}
                </div>
                <p className="text-foreground">
                  &ldquo;Tresta made it incredibly easy to collect and display
                  customer testimonials. Set it up in minutes and it just
                  works.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    JD
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Jane Doe</div>
                    <div className="text-sm text-muted-foreground">
                      Product Manager, Acme Inc
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Snippet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-4"
            >
              <CodeBlock
                code={`<script src="https://tresta.app/widget.js" 
  data-project="your-project"
  data-layout="carousel">
</script>`}
                language="html"
                copyable
              />
            </motion.div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -right-4 -top-4 hidden lg:block"
            >
              <div className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                ✓ OAuth Verified
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    </section>
  );
}
