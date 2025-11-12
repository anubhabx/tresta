import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Activity, Database, Home } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-6">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span className="font-bold">Tresta Admin</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            <Home className="inline h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <Link
            href="/dlq"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            <Database className="inline h-4 w-4 mr-1" />
            Dead Letter Queue
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
