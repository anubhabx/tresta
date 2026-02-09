"use client";

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-muted/30 px-4 py-24 md:px-8 md:py-32">
      <div className="container relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Ready to stop screenshotting tweets?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-8 max-w-xl text-lg text-muted-foreground"
        >
          Free for your first 50 testimonials. No credit card required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/sign-up">
              Start collecting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
