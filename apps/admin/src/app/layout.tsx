import type { Metadata } from "next";
import "@workspace/ui/globals.css";
import { Figtree } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from '@/lib/providers';

const fontSans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Tresta Admin Panel",
  description: "Admin panel for managing the Tresta notification and testimonial system",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${fontSans.variable} font-sans antialiased`}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 rounded-md bg-background px-4 py-2 text-foreground ring-2 ring-primary"
          >
            Skip to content
          </a>
          <Providers>
            <main id="main-content">{children}</main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
