"use client";

import { SectionHeader } from "./section-header";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Card, CardContent } from "@workspace/ui/components/card";
import { motion } from "framer-motion";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Product Manager",
        company: "TechFlow",
        content:
            "Tresta transformed how we collect feedback. We went from manual emails to a fully automated system in days.",
        avatar: "/avatars/sarah.jpg",
    },
    {
        name: "Mark Davis",
        role: "Founder",
        company: "StartUp Inc",
        content:
            "The widgets look amazing on our landing page. They blend in perfectly with our design system.",
        avatar: "/avatars/mark.jpg",
    },
    {
        name: "Jessica Lee",
        role: "Marketing Director",
        company: "Growth.io",
        content:
            "Moderation is a breeze. The AI filtering saves us hours every week. Highly recommended!",
        avatar: "/avatars/jessica.jpg",
    },
    {
        name: "Alex Thompson",
        role: "Developer",
        company: "CodeCraft",
        content:
            "Integration was super simple. Copied the snippet and it just worked. The API is also great for custom needs.",
        avatar: "/avatars/alex.jpg",
    },
    {
        name: "Emily Wilson",
        role: "Designer",
        company: "Creative Studio",
        content:
            "Finally, a testimonial tool that actually cares about design. The layouts are beautiful out of the box.",
        avatar: "/avatars/emily.jpg",
    },
];

export function Testimonials() {
    return (
        <section className="overflow-hidden py-24 md:py-32 bg-zinc-950/50">
            <div className="container mb-16">
                <SectionHeader
                    title="Loved by thousands of creators"
                    description="Don't just take our word for it. See what others are saying about Tresta."
                />
            </div>

            <div className="relative flex w-full overflow-hidden py-4">
                <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
                <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

                <motion.div
                    className="flex gap-6"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30,
                    }}
                >
                    {[...testimonials, ...testimonials].map((testimonial, index) => (
                        <Card
                            key={index}
                            className="w-[350px] flex-shrink-0 border-zinc-800 bg-zinc-900/40 backdrop-blur-sm"
                        >
                            <CardContent className="p-6">
                                <p className="mb-6 text-muted-foreground">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {testimonial.role}, {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
