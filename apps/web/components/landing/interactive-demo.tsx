"use client";

import { useState } from "react";
import { SectionHeader } from "./section-header";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Moon, Sun, LayoutGrid, List } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const testimonials = [
    {
        id: 1,
        name: "Sarah Chen",
        role: "Product Manager",
        company: "TechFlow",
        content: "Tresta has completely transformed how we gather feedback. The AI moderation is a game-changer, saving us hours every week.",
        avatar: "SC",
        color: "bg-blue-500",
    },
    {
        id: 2,
        name: "Marcus Rodriguez",
        role: "Founder",
        company: "GrowthLabs",
        content: "Setting up the widgets took less than 5 minutes. Our conversion rate increased by 24% in the first month alone.",
        avatar: "MR",
        color: "bg-emerald-500",
    },
    {
        id: 3,
        name: "Emily Watson",
        role: "Marketing Director",
        company: "Creative Studio",
        content: "The design customization is incredible. It fits perfectly with our brand guidelines, and the dark mode support is flawless.",
        avatar: "EW",
        color: "bg-purple-500",
    },
    {
        id: 4,
        name: "David Kim",
        role: "CTO",
        company: "SaaSify",
        content: "Finally, a testimonial tool that developers actually enjoy using. The API is clean, well-documented, and reliable.",
        avatar: "DK",
        color: "bg-orange-500",
    },
];

export function InteractiveDemo() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [layout, setLayout] = useState<"grid" | "list">("grid");

    return (
        <section className="bg-zinc-950/50 mx-auto py-24 px-4 md:px-24 md:py-32">
            <div className="container">
                <SectionHeader
                    title="See it in action"
                    description="Customize the look and feel to match your brand perfectly."
                />

                <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                    {/* Controls */}
                    <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500/20" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                            <div className="h-3 w-3 rounded-full bg-green-500/20" />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="h-8 w-8 px-0"
                            >
                                {theme === "dark" ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
                                className="h-8 w-8 px-0"
                            >
                                {layout === "grid" ? (
                                    <List className="h-4 w-4" />
                                ) : (
                                    <LayoutGrid className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div
                        className={cn(
                            "min-h-[400px] p-8 transition-colors duration-300",
                            theme === "dark" ? "bg-zinc-950" : "bg-white"
                        )}
                    >
                        <div
                            className={cn(
                                "grid gap-4",
                                layout === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                            )}
                        >
                            {testimonials.map((testimonial) => (
                                <Card
                                    key={testimonial.id}
                                    className={cn(
                                        "transition-all duration-300",
                                        theme === "dark"
                                            ? "border-zinc-800 bg-zinc-900 text-white"
                                            : "border-zinc-200 bg-white text-zinc-900"
                                    )}
                                >
                                    <CardContent className="p-6">
                                        <div className="mb-4 flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="h-4 w-4 text-yellow-500"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            ))}
                                        </div>
                                        <p
                                            className={cn(
                                                "mb-4 text-sm",
                                                theme === "dark" ? "text-zinc-400" : "text-zinc-600"
                                            )}
                                        >
                                            &quot;{testimonial.content}&quot;
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white",
                                                    testimonial.color
                                                )}
                                            >
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{testimonial.name}</p>
                                                <p
                                                    className={cn(
                                                        "text-xs",
                                                        theme === "dark" ? "text-zinc-500" : "text-zinc-500"
                                                    )}
                                                >
                                                    {testimonial.role}, {testimonial.company}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
