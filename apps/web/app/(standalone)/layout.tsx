import React from "react";

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
}
