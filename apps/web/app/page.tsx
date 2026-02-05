import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { SiteFooter } from "@/components/site-footer";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <div id="features">
          <Features />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="interactive-demo">
          <InteractiveDemo />
        </div>
        <div id="faq">
          <FAQ />
        </div>
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}
