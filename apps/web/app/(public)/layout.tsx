import { LandingNavbar } from "@/components/landing/landing-navbar";
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
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
