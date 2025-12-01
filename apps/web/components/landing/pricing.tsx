"use client";

import { SectionHeader } from "./section-header";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for side projects and personal portfolios.",
        features: [
            "1 Project",
            "50 Testimonials",
            "Basic Widgets",
            "Standard Moderation",
        ],
        cta: "Start for Free",
        href: "/sign-up",
        popular: false,
    },
    {
        name: "Pro",
        price: "$29",
        description: "For growing businesses and agencies.",
        features: [
            "Unlimited Projects",
            "Unlimited Testimonials",
            "Premium Widgets",
            "AI Moderation",
            "Remove Branding",
            "Priority Support",
        ],
        cta: "Get Started",
        href: "/sign-up?plan=pro",
        popular: true,
    },
];

export function Pricing() {
    return (
        <section className="container mx-auto py-24 px-4 md:px-24 md:py-32">
            <SectionHeader
                title="Simple, transparent pricing"
                description="Start for free, upgrade when you grow."
            />

            <div className="grid gap-8 md:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
                {plans.map((plan, index) => (
                    <Card
                        key={index}
                        className={`relative flex flex-col ${plan.popular
                            ? "border-teal-500 shadow-lg shadow-teal-500/20"
                            : "border-zinc-800"
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-1 text-xs font-bold text-white">
                                Most Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <div className="mt-4 flex items-baseline text-5xl font-bold tracking-tight">
                                {plan.price}
                                <span className="ml-1 text-xl font-medium text-muted-foreground">
                                    /mo
                                </span>
                            </div>
                            <p className="mt-4 text-muted-foreground">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-4">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="h-4 w-4 text-teal-500" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={plan.popular ? "default" : "outline"}
                                asChild
                            >
                                <Link href={plan.href}>{plan.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div >
        </section >
    );
}
