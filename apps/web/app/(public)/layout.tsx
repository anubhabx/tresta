import { SiteHeader } from "@/components/landing/site-header";
import { Footer } from "@/components/landing/pricing-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
