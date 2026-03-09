import { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeatureBento } from "@/components/landing/feature-bento";
import { DxTerminal } from "@/components/landing/dx-terminal";
import { PricingCTA, Footer } from "@/components/landing/pricing-footer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      <SiteHeader />
      <main className="flex-1 flex flex-col w-full">
        <HeroSection />
        <HowItWorks />
        <FeatureBento />
        <DxTerminal />
        <PricingCTA />
      </main>
      <Footer />
    </div>
  );
}
