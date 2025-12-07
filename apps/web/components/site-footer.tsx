import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-foreground">
          <Image
            src="/branding/tresta.svg"
            alt="Tresta logo"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <span className="font-semibold tracking-tight">Tresta</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/contact-us" className="hover:text-foreground transition-colors">Contact Us</Link>
          <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/cancellations-and-refunds" className="hover:text-foreground transition-colors">Cancellations</Link>
          <Link href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@tresta.app"}`} className="hover:text-foreground transition-colors">
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@tresta.app"}
          </Link>
        </div>

        <p className="text-xs sm:text-sm">&copy; {year} Tresta. All rights reserved.</p>
      </div>
    </footer>
  );
}
