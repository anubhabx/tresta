import { Suspense } from "react";
import { PricingTable } from "@/components/billing/pricing-table";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Gift, Rocket, Shield, Sparkles } from "lucide-react";

export const metadata = {
  title: "Pricing - Tresta",
  description:
    "Simple, transparent pricing for your testimonial collection needs. Start free, upgrade when ready.",
};

const planJustifications = [
  {
    icon: Sparkles,
    title: "Free Plan",
    subtitle: "No Strings Attached",
    description:
      "We believe you should try before you buy. The Free plan gives you everything you need to validate testimonials as a growth lever: one project, 10 testimonials, one production-ready widget, and API access for fetching testimonials with rate limits. No credit card required.",
  },
  {
    icon: Rocket,
    title: "Pro Plan",
    subtitle: "Unlimited Everything",
    description:
      "When social proof becomes central to your business, limits become friction. Pro removes core caps: unlimited projects, unlimited testimonials, and unlimited widgets. Plus video testimonials, custom branding, and priority support.",
  },
  {
    icon: Gift,
    title: "Yearly Billing",
    subtitle: "2 Months Free",
    description:
      "Commit for a year and we'll reward you with 2 months free. That's ₹600 saved annually, plus early access to new features and a dedicated onboarding call to help you maximize your testimonial strategy.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    subtitle: "Powered by Razorpay",
    description:
      "All payments are processed securely through Razorpay. We support UPI, cards, net banking, and wallets. Your payment information never touches our servers.",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12 px-4 pt-24">
      {/* Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Start collecting testimonials for free. Upgrade when you need more
          power. No hidden fees. Cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <Suspense>
        <PricingTable />
      </Suspense>

      {/* Plan Justifications */}
      <div className="mt-24 max-w-5xl mx-auto">
        <Separator className="mb-12" />

        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Why These Plans?</h2>
          <p className="text-muted-foreground">
            Built for developers and indie hackers who value simplicity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {planJustifications.map((item) => (
            <Card
              key={item.title}
              className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/15">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm font-medium text-primary/80">
                        {item.subtitle}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-12" />

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Questions? Reach out at{" "}
            <a
              href="mailto:support@tresta.io"
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              support@tresta.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
