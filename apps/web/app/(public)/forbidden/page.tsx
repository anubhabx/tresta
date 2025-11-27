import Link from "next/link";
import { LockKeyhole, ArrowLeftRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-destructive/10 text-destructive">
              <LockKeyhole className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-3xl">Access restricted</CardTitle>
          <CardDescription className="text-base">
            You found an area that exists, but your account doesn&apos;t have the
            required permissions. Reach out to your workspace admin if you need
            access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground text-left">
            <p className="font-medium text-foreground mb-1">Next steps:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Return to the dashboard to continue working</li>
              <li>Ask an admin to grant additional permissions</li>
              <li>Contact support if you believe this is an error</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link href="/dashboard">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="flex-1">
              <a href="mailto:support@tresta.com">Contact support</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
