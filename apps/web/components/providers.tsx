"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AblyProvider } from "./ably-provider";

import { Toaster } from "@workspace/ui/components/sonner";
import dynamic from "next/dynamic";

const UpgradeModal = dynamic(() => import("./billing/upgrade-modal").then(mod => mod.UpgradeModal), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AblyProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          {children}
          <Toaster position="bottom-right" />
          <UpgradeModal />
        </NextThemesProvider>
      </AblyProvider>
    </QueryClientProvider>
  );
}
