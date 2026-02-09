"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Menu,
  X,
  Zap,
  CircleHelp,
  BookOpen,
  Mail,
  ArrowRight,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@workspace/ui/components/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";

// Navigation link data
const productLinks = [
  {
    title: "Features",
    href: "/#features",
    description: "Explore what Tresta can do for you",
    icon: Zap,
  },
  {
    title: "How It Works",
    href: "/#how-it-works",
    description: "See the simple 3-step process",
    icon: CircleHelp,
  },
  {
    title: "Interactive Demo",
    href: "/#interactive-demo",
    description: "Try it out without signing up",
    icon: ArrowRight,
  },
];

const resourceLinks = [
  {
    title: "Contact Us",
    href: "/contact-us",
    description: "Get in touch with our team",
    icon: Mail,
  },
  {
    title: "FAQ",
    href: "/#faq",
    description: "Common questions answered",
    icon: CircleHelp,
  },
];

// Dropdown link component
function NavLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className="flex items-start gap-3 rounded-md p-3 hover:bg-accent transition-colors group"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

export function LandingNavbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll position for glass effect enhancement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50",
        "bg-background/80 backdrop-blur-xl",
        "transition-all duration-300",
        isScrolled && "bg-background/95 border-b border-border shadow-sm",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/branding/tresta.svg"
            width={28}
            height={28}
            alt="Tresta Logo"
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Tresta
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {/* Product Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">
                Product
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[320px] gap-1 p-2">
                  {productLinks.map((link) => (
                    <li key={link.href}>
                      <NavLink {...link} />
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Resources Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[320px] gap-1 p-2">
                  {resourceLinks.map((link) => (
                    <li key={link.href}>
                      <NavLink {...link} />
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Pricing Link */}
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-md px-4 py-2",
                    "text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    pathname === "/pricing" &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isSignedIn ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src="/branding/tresta.svg"
                    width={24}
                    height={24}
                    alt="Tresta"
                  />
                  Tresta
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-6">
                {/* Product Section */}
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Product
                  </h3>
                  <div className="flex flex-col gap-1">
                    {productLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {link.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Resources Section */}
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resources
                  </h3>
                  <div className="flex flex-col gap-1">
                    {resourceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <link.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {link.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <Link
                  href="/pricing"
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-sm font-medium">Pricing</span>
                </Link>

                {/* Auth Buttons */}
                <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                  {isSignedIn ? (
                    <Button asChild className="w-full">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/sign-up">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
