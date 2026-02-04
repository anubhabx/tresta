"use client";

import { SectionHeader } from "./section-header";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Pricing plans aligned with the database UserPlan enum and actual limits
 * Designed to be affordable for the target audience (Indian developers)
 */
const plans = [
  {
    name: "Free",
    price: "₹0",
    priceUSD: "$0",
    period: "forever",
    description: "Perfect for trying out Tresta and side projects.",
    features: [
      "1 project",
      "50 testimonials",
      "Basic widget layouts",
      "Standard moderation",
      "Tresta branding on widgets",
    ],
    limitations: ["No AI moderation", "No custom branding"],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹400",
    priceUSD: "$5",
    period: "/month",
    description: "For growing projects and businesses.",
    features: [
      "Unlimited projects",
      "Unlimited testimonials",
      "All 5 widget layouts",
      "AI auto-moderation",
      "Remove Tresta branding",
      "Custom brand colors",
      "OAuth verification badges",
      "Priority support",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    href: "/sign-up?plan=pro",
    popular: true,
  },
];

export function Pricing() {
  return (
    <section className="container mx-auto px-4 py-24 md:px-8 md:py-32">
      <SectionHeader
        title="Simple, affordable pricing"
        description="Start free. Upgrade when you need more. No hidden fees."
      />

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 lg:gap-12">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={cn(
              "relative flex flex-col border",
              plan.popular
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-border"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                {plan.priceUSD !== plan.price && (
                  <span className="text-sm text-muted-foreground">
                    ({plan.priceUSD})
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li
                    key={`limit-${i}`}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <span className="mt-0.5 h-4 w-4 shrink-0 text-center text-xs">
                      —
                    </span>
                    <span className="text-sm">{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4">
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
      </div>

      {/* FAQ-style note */}
      <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground">
        All plans include a 14-day money-back guarantee. Cancel anytime.
        <br />
        Need a custom plan for your team?{" "}
        <Link href="/contact-us" className="text-primary hover:underline">
          Contact us
        </Link>
        .
      </p>
    </section>
  );
}
