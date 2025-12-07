import { BackgroundBeams } from "@workspace/ui/components/background-beams";
import { Button } from "@workspace/ui/components/button";
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
    <div className="relative h-svh">
      <BackgroundBeams className="-z-10" />
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
}
