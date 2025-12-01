"use client";

import { SectionHeader } from "./section-header";
import { motion } from "framer-motion";
import { Link, CheckCircle, Code } from "lucide-react";

const steps = [
    {
        title: "Collect",
        description: "Create a unique link and share it with your customers.",
        icon: Link,
    },
    {
        title: "Moderate",
        description: "Approve the best testimonials with a single click.",
        icon: CheckCircle,
    },
    {
        title: "Showcase",
        description: "Copy the embed code and paste it on your website.",
        icon: Code,
    },
];

export function HowItWorks() {
    return (
        <section className="container mx-auto py-24 px-4 md:px-24 md:py-32">
            <SectionHeader title="How it Works" description="" />

            <div className="relative flex flex-col items-center justify-between gap-12 md:flex-row">
                {/* Connecting Line (Desktop) */}
                <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent md:block" />

                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className="relative z-10 flex flex-col items-center text-center"
                    >
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-teal-500/20 bg-zinc-950 shadow-[0_0_30px_-10px_rgba(20,184,166,0.5)]">
                            <step.icon className="h-8 w-8 text-teal-500" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                        <p className="max-w-[250px] text-muted-foreground">
                            {step.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section >
    );
}
