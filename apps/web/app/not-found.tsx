import Link from "next/link";
import { Compass, ArrowLeft, LifeBuoy } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full shadow-xl border-border/70">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Compass className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Page Not Found</CardTitle>
          <CardDescription className="text-base">
            We couldn&apos;t find the page you were looking for. It may have
            been moved, deleted, or never existed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-lg border bg-background p-4 text-sm text-muted-foreground">
            <p>Here are a few things you can try:</p>
            <ul className="list-disc pl-5 space-y-2 text-left">
              <li>Double-check the URL for typos</li>
              <li>Use the navigation to find the correct section</li>
              <li>Reach out if you believe this is a mistake</li>
            </ul>
          </div>
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="flex-1">
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@tresta.app"}`}
              >
                <LifeBuoy className="mr-2 h-4 w-4" />
                Contact support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
