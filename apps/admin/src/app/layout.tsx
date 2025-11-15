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
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
