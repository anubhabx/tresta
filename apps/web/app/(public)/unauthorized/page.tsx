import Link from "next/link";
import { ShieldAlert, LogIn } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-700">
              <ShieldAlert className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-3xl">Sign in required</CardTitle>
          <CardDescription className="text-base">
            You need to be signed in to access this area. Please log in with
            your workspace account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            Tip: If you just signed out, signing back in will return you to
            this page automatically.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link href="/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Go to sign in
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="flex-1">
              <Link href="/">
                Return home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
