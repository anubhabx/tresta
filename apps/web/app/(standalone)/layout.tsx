import { BackgroundBeams } from "@workspace/ui/components/background-beams";
import React from "react";

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <main className="flex-1 relative">
        <BackgroundBeams className="-z-10" />
        {children}
      </main>
    </div>
  );
}
