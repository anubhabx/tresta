import { LandingNavbar } from "@/components/landing/landing-navbar";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Your Testimonial",
  description: "Share your experience and feedback with us",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <main className="mx-auto">{children}</main>
      <SiteFooter />
    </div>
  );
}
