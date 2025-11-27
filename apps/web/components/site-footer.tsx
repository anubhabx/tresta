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
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/settings/notifications" className="hover:text-foreground transition-colors">
            Notifications
          </Link>
          <Link href="mailto:support@tresta.com" className="hover:text-foreground transition-colors">
            support@tresta.com
          </Link>
        </div>

        <p className="text-xs sm:text-sm">&copy; {year} Tresta. All rights reserved.</p>
      </div>
    </footer>
  );
}
