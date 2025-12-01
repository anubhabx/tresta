"use client";

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
    return (
        <section className="relative overflow-hidden py-24 px-4 md:px-24 md:py-32">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-500/10" />
            <div className="container relative z-10 flex flex-col items-center text-center">
                <h2 className="mb-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
                    Ready to build trust with your customers?
                </h2>
                <p className="mb-10 max-w-xl text-lg text-muted-foreground">
                    Join thousands of businesses using Tresta to collect and showcase
                    authentic social proof.
                </p>
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                    <Link href="/sign-up">
                        Get Started for Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
