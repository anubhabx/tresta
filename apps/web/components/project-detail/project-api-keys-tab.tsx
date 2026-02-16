"use client";

import Link from "next/link";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

export function ProjectApiKeysTab() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>API key management has moved to account settings.</p>
          <p>Use Account Settings → API &amp; Tokens for create, list, and revoke operations.</p>
          <Button asChild size="sm" className="mt-2">
            <Link href="/account?tab=api">Go to API &amp; Tokens</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
