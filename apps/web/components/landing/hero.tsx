
"use client";

import { Button } from "@workspace/ui/components/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
    return (
        <section className="relative flex min-h-[90vh] px-4 md:px-24 flex-col items-center justify-center overflow-hidden bg-background py-24 md:py-32">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-500/20 blur-[100px]" />
                <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[100px]" />
                <div className="absolute bottom-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-sm font-medium text-teal-400 backdrop-blur-sm"
                >
                    <span className="mr-2 flex h-2 w-2">
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
                    </span>
                    Social Proof Made Simple
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-6 max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-7xl md:text-8xl"
                >
                    Turn Customer Love <br />
                    <span className="bg-gradient-to-r from-teal-400 to-cyan-600 bg-clip-text text-transparent">
                        Into Growth
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
                >
                    The all-in-one platform to collect, manage, and showcase authentic
                    customer testimonials. Build trust and boost conversions in minutes.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col gap-4 sm:flex-row"
                >
                    <Button size="lg" className="h-12 px-8 text-base" asChild>
                        <Link href="/sign-up">
                            Get Started for Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-12 px-8 text-base"
                        asChild
                    >
                        <Link href="/demo">
                            <Play className="mr-2 h-4 w-4" />
                            View Demo
                        </Link>
                    </Button>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
                    className="relative mt-20 w-full max-w-5xl perspective-1000"
                >
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-cyan-500/10" />
                        {/* Placeholder for Dashboard Image - using a div for now to simulate the look */}
                        <div className="aspect-[16/9] w-full bg-zinc-900/50 p-4">
                            <div className="h-full w-full overflow-hidden rounded-lg border border-white/5 bg-zinc-950 shadow-inner">
                                <div className="flex h-12 items-center border-b border-white/5 px-4">
                                    <div className="flex space-x-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500/20" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                                        <div className="h-3 w-3 rounded-full bg-green-500/20" />
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div className="h-8 w-48 rounded bg-zinc-800" />
                                        <div className="h-8 w-24 rounded bg-teal-600/20" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="h-32 rounded-lg bg-zinc-900 border border-white/5" />
                                        <div className="h-32 rounded-lg bg-zinc-900 border border-white/5" />
                                        <div className="h-32 rounded-lg bg-zinc-900 border border-white/5" />
                                    </div>
                                    <div className="mt-8 h-64 rounded-lg bg-zinc-900 border border-white/5" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Glow effect behind the dashboard */}
                    <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-2xl" />
                </motion.div>
            </div>
        </section>
    );
}
