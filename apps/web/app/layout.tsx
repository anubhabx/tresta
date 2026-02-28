import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Instrument_Serif,
  Cormorant_Garamond,
} from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import { ClerkProvider } from "@clerk/nextjs";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const fontEditorial = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-editorial",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description:
      "The all-in-one platform to collect, manage, and showcase authentic customer testimonials.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tresta - Collect & Showcase Social Proof",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tresta - Collect & Showcase Social Proof",
    description:
      "The all-in-one platform to collect, manage, and showcase authentic customer testimonials.",
    creator: "@tresta",
    images: ["/twitter-image"],
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#60a5fa",
          colorBackground: "#111318",
          colorInputBackground: "#0c0e12",
          colorInputText: "#e8eaed",
          colorText: "#e8eaed",
          colorTextSecondary: "#8b8f99",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} ${fontEditorial.variable} font-sans antialiased`}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 rounded-md bg-background px-4 py-2 text-foreground ring-2 ring-primary"
          >
            Skip to content
          </a>
          <Providers>
            <div className="flex min-h-svh flex-col">
              <main id="main-content" className="flex-1">
                {children}
              </main>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
