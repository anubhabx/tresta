import dynamic from "next/dynamic";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { Hero } from "@/components/landing/hero";
import { PageWrapper } from "@/components/landing/page-wrapper";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

/* ── Below-fold components: code-split & lazy-loaded ─────────── */
const PainSection = dynamic(
  () => import("@/components/landing/pain-section").then((m) => m.PainSection),
);
const Features = dynamic(
  () => import("@/components/landing/features").then((m) => m.Features),
);
const InteractiveDemo = dynamic(
  () => import("@/components/landing/interactive-demo").then((m) => m.InteractiveDemo),
);
const IntegrationSection = dynamic(
  () => import("@/components/landing/integration-section").then((m) => m.IntegrationSection),
);
const FAQ = dynamic(
  () => import("@/components/landing/faq").then((m) => m.FAQ),
);
const CTA = dynamic(
  () => import("@/components/landing/cta").then((m) => m.CTA),
);
const SiteFooter = dynamic(
  () => import("@/components/site-footer").then((m) => m.SiteFooter),
);

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* ── JSON-LD Structured Data ─────────────────────────────────── */

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  sameAs: [],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need coding skills to use Tresta?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not at all! You can create forms and widgets using our visual editor, then simply copy-paste the embed code into your site. No technical skills required.",
      },
    },
    {
      "@type": "Question",
      name: "Can I import existing testimonials?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can manually add existing testimonials or import them via CSV. Bulk import with AI analysis coming soon.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free trial?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer a generous free tier that is free forever. Upgrade anytime to unlock advanced features like custom branding and unlimited testimonials.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the design?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Our widgets are fully customizable — adjust colors, fonts, layout and more to match your brand perfectly.",
      },
    },
  ],
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <LandingNavbar />
      <main className="flex-1">
        <PageWrapper gridVariant="grid-small">
          <Hero />

          <PainSection />

          <Features />

          <InteractiveDemo />

          {/* <Testimonials /> */}

          <IntegrationSection />

          <FAQ />

          <CTA />
        </PageWrapper>
      </main>
      <SiteFooter />
    </div>
  );
}
