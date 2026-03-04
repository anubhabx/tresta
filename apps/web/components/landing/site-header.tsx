import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="fixed top-4 inset-x-0 mx-auto w-[95%] max-w-5xl z-50 rounded-xl border border-border/40 bg-background/60 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 py-2 flex h-14 items-center justify-between">
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/branding/tresta.svg"
              alt="Tresta Logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8"
            />
            <span className="font-bold sm:inline-block">Tresta</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center space-x-6 text-sm font-medium text-muted-foreground">
          <Link
            href="/pricing"
            className="transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/contact-us"
            className="transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block"
              >
                Log In
              </Link>
              <Button
                asChild
                className="rounded-md px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button
                asChild
                className="rounded-md px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  );
}
