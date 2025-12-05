import { LandingNavbar } from "@/components/landing/landing-navbar";
import { BackgroundBeams } from "@workspace/ui/components/background-beams";
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
    <div className="relative pt-24">
      <LandingNavbar />
      {children}
    </div>
  );
}
