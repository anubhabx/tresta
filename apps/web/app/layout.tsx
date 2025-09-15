import { Figtree, Lora, Fira_Code } from "next/font/google";

import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";

const fontSans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans"
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono"
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif"
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} font-sans antialiased `}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
