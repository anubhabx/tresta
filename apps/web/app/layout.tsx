import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

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
          className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
        >
          <Providers>
            <div className="flex min-h-svh flex-col">
              <main className="flex-1">{children}</main>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
