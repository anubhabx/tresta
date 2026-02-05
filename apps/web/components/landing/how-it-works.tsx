"use client";

import { SectionHeader } from "./section-header";
import { motion } from "framer-motion";
import { Link2, CheckCircle, Code } from "lucide-react";

const steps = [
  {
    step: "1",
    title: "Collect",
    description: "Share your unique collection link with customers.",
    icon: Link2,
  },
  {
    step: "2",
    title: "Moderate",
    description: "Review and approve testimonials with one click.",
    icon: CheckCircle,
  },
  {
    step: "3",
    title: "Embed",
    description: "Copy one line of code and paste on your site.",
    icon: Code,
  },
];

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-24 md:px-8 md:py-32">
      <SectionHeader
        title="Three steps to social proof"
        description="From signup to embedded testimonials in under 2 minutes."
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Connecting Line (Desktop) */}
        <div className="absolute left-0 top-8 hidden h-0.5 w-full bg-border md:block" />

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number with icon */}
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="max-w-[250px] text-sm text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
