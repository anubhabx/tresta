import { Figtree, Lora, Fira_Code } from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@workspace/ui/components/sonner";
import { SiteFooter } from "@/components/site-footer";

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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
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
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
