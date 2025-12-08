import { Figtree, Lora, Fira_Code } from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@workspace/ui/components/sonner";
import { SiteFooter } from "@/components/site-footer";
import { UpgradeModal } from "@/components/billing/upgrade-modal";

const fontSans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata = {
  title: "Tresta - Collect & Showcase Social Proof",
  description:
    "The all-in-one platform to collect, manage, and showcase authentic customer testimonials. Turn customer love into growth with Tresta.",
  openGraph: {
    title: "Tresta - Collect & Showcase Social Proof",
    description:
      "The all-in-one platform to collect, manage, and showcase authentic customer testimonials.",
    url: "https://tresta.app",
    siteName: "Tresta",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tresta - Collect & Showcase Social Proof",
    description:
      "The all-in-one platform to collect, manage, and showcase authentic customer testimonials.",
    creator: "@tresta",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} font-sans antialiased `}
        >
          <Providers>
            <div className="flex min-h-svh flex-col">
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster position="bottom-right" />
            <UpgradeModal />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
