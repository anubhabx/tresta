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
    <div className="relative">
      <BackgroundBeams className="-z-10" />
      {children}
    </div>
  );
}
