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
import { Check, Code, MessageSquare, Shield, Sparkles, Zap } from "lucide-react";

const features = [
    {
        title: "Effortless Collection",
        description:
            "Create beautiful, branded forms in seconds. Share your unique link and start collecting testimonials immediately.",
        icon: MessageSquare,
        className: "md:col-span-2",
    },
    {
        title: "AI Moderation",
        description:
            "Automatically filter spam and detect sentiment. Keep your social proof authentic and safe.",
        icon: Shield,
        className: "md:col-span-1",
    },
    {
        title: "Beautiful Widgets",
        description:
            "Embed testimonials on your site with a single line of code. Choose from 5+ premium layouts.",
        icon: Code,
        className: "md:col-span-1",
    },
    {
        title: "Fast Integration",
        description:
            "Works with any website builder. React, Vue, WordPress, Webflow, and more.",
        icon: Zap,
        className: "md:col-span-2",
    },
];

export function Features() {
    return (
        <section className="container mx-auto py-24 px-4 md:px-24 md:py-32">
            <SectionHeader
                title="Everything you need to build trust"
                description="Powerful features designed to help you collect, manage, and showcase social proof without the headache."
            />

            <div className="grid gap-6 md:grid-cols-3">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className={feature.className}
                    >
                        <Card className="h-full justify-between overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-colors hover:bg-zinc-900/80">
                            <CardHeader>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                                <CardDescription className="text-base flex-1 h-full">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Visual placeholder for each feature */}
                                <div className="relative h-40 w-full overflow-hidden rounded-lg bg-zinc-950/50 border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />
                                    {/* Abstract shapes/lines */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <Sparkles className="h-12 w-12 text-white/10" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section >
    );
}
