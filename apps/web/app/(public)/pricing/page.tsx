import { Suspense } from "react";
import { PricingTable } from "@/components/billing/pricing-table";
import { Spotlight } from "@/components/ui/spotlight-new";
import { Gift, Rocket, Shield, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Pricing - Tresta",
  description:
    "Simple, transparent pricing for your testimonial collection needs. Start free, upgrade when ready.",
  alternates: { canonical: "/pricing" },
};

/* ── JSON-LD: SoftwareApplication + Offers ───────────────────── */

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  url: siteConfig.url,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "INR",
      description: "Perfect for trying out Tresta",
      url: `${siteConfig.url}/pricing`,
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "300",
      priceCurrency: "INR",
      description: "For growing businesses — billed monthly",
      url: `${siteConfig.url}/pricing`,
    },
    {
      "@type": "Offer",
      name: "Pro Yearly",
      price: "3000",
      priceCurrency: "INR",
      description: "Best value — 2 months free, billed yearly",
      url: `${siteConfig.url}/pricing`,
    },
  ],
};

const planJustifications = [
  {
    icon: Sparkles,
    title: "Free Plan",
    subtitle: "No Strings Attached",
    description:
      "We believe you should try before you buy. The Free plan gives you everything you need to validate testimonials as a growth lever: one project, 10 testimonials, one production-ready widget, and API access. No credit card required.",
  },
  {
    icon: Rocket,
    title: "Pro Plan",
    subtitle: "Unlimited Everything",
    description:
      "When social proof becomes central to your business, limits become friction. Pro removes all caps: unlimited projects, testimonials, and widgets. Plus video testimonials, custom branding, and priority support.",
  },
  {
    icon: Gift,
    title: "Yearly Billing",
    subtitle: "2 Months Free",
    description:
      "Commit for a year and we'll reward you with 2 months free. That's ₹600 saved annually, plus early access to new features and a dedicated onboarding call.",
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
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Spotlight at page level so it bleeds through the pricing cards */}
      <Spotlight />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />

      {/* Hero header */}
      <section className="relative pt-32 pb-24">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] opacity-[0.08]">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-md border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm mb-8">
            <span className="text-sm font-medium tracking-tight text-zinc-300">
              Simple, Transparent Pricing
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tight text-white leading-[1.1] mb-6">
            Pricing that{" "}
            <span className="text-zinc-500 italic">scales with you.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            Start collecting testimonials for free. Upgrade when you need more
            power. No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense>
            <PricingTable />
          </Suspense>
        </div>
      </section>

      {/* Plan justifications */}
      <section className="py-24 border-t border-white/5 bg-[#050505]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
              Why these plans?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Built for developers and founders who value simplicity and
              transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {planJustifications.map((item) => (
              <div
                key={item.title}
                className="group relative rounded-lg border border-white/8 bg-white/[0.02] p-6 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300"
              >
                {/* Subtle top glow on hover */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/40 transition-all duration-500" />

                <div className="flex items-start gap-4">
                  <div className="shrink-0 p-2.5 rounded-lg bg-zinc-900 border border-white/8 text-primary group-hover:border-primary/30 transition-colors">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm font-medium text-primary/80">
                      {item.subtitle}
                    </p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-16 text-center text-sm text-zinc-600">
            <p>
              Questions?{" "}
              <a
                href="mailto:support@tresta.io"
                className="text-zinc-400 hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400"
              >
                support@tresta.io
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
