import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Hero } from "@/components/landing/hero";
import { PainSection } from "@/components/landing/pain-section";
import { Features } from "@/components/landing/features";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { Testimonials } from "@/components/landing/testimonials";
import { IntegrationSection } from "@/components/landing/integration-section";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { SiteFooter } from "@/components/site-footer";
import { PageWrapper } from "@/components/landing/page-wrapper";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        {/* 
          PageWrapper provides two atmospheric background layers:
          - Variant A: Animated SVG beams (Linear/Vercel aesthetic)
          - Variant B: Subtle grid pattern with radial fade (Blueprint feel)
          Both are combined by default. Switch variant="beams" or variant="grid" to isolate.
        */}
        <PageWrapper variant="combined" gridVariant="grid-small">
          <Hero />

          <PainSection />

          <Features />

          <InteractiveDemo />

          <Testimonials />

          <IntegrationSection />

          <FAQ />

          <CTA />
        </PageWrapper>
      </main>
      <SiteFooter />
    </div>
  );
}
