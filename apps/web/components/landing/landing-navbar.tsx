"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function LandingNavbar() {
    const { isSignedIn } = useUser();
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/30 backdrop-blur-md px-4 md:px-24">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src={"/branding/tresta.svg"} width={32} height={32} alt="Tresta Logo" />
                    <span className="text-xl font-bold tracking-tight">Tresta</span>
                </Link>

                <nav className="hidden gap-6 md:flex" hidden={pathname !== "/"}>
                    <Link
                        href="#features"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Features
                    </Link>
                    <Link
                        href="#how-it-works"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        How it Works
                    </Link>
                    <Link
                        href="#pricing"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Pricing
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {isSignedIn ? (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/sign-in">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/sign-up">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
