"use client";

import { motion } from "framer-motion";
import { Code2, MessageSquareQuote, Shield, Zap } from "lucide-react";

/**
 * Social proof section showing product capabilities and statistics
 * For an MVP, showing capabilities is more authentic than fake company logos
 */
const proofPoints = [
  {
    icon: Zap,
    value: "< 2 min",
    label: "Setup time",
  },
  {
    icon: MessageSquareQuote,
    value: "5",
    label: "Widget layouts",
  },
  {
    icon: Code2,
    value: "1 line",
    label: "To embed",
  },
  {
    icon: Shield,
    value: "100%",
    label: "GDPR compliant",
  },
];

export function SocialProof() {
  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {proofPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <point.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground md:text-3xl">
                {point.value}
              </div>
              <div className="text-sm text-muted-foreground">{point.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
