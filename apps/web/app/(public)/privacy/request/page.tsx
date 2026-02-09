"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import { CustomFormField } from "@/components/custom-form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ShieldCheck, Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRequestPrivacyAccess } from "@/lib/queries/privacy";

const requestFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type FormData = z.infer<typeof requestFormSchema>;

export default function PrivacyRequestPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  const { mutate: requestAccess, isPending } = useRequestPrivacyAccess();

  const form = useForm<FormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: FormData) => {
    requestAccess(data, {
      onSuccess: (res) => {
        setIsSubmitted(true);
        toast.success("Request submitted successfully");

        // In dev mode, we might receive the link back for easier testing
        if (res?.debugLink) {
          setMagicLink(res.debugLink);
        }
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to submit request. Please try again.");
      },
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen max-w-xl flex items-center justify-center p-4 bg-muted/10">
        <Card className="w-full">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Mail className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Check Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a magic link to the email you provided. Click the
                link to access your data management portal.
              </p>
            </div>

            {magicLink && (
              <div className="mt-6 p-4 bg-muted rounded border text-left overflow-hidden">
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  [DEV ONLY] Magic Link:
                </p>
                <a
                  href={magicLink}
                  className="text-sm text-primary break-all hover:underline"
                >
                  {magicLink}
                </a>
              </div>
            )}

            <Button asChild variant="outline" className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/10">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Manage Your Data</CardTitle>
          <CardDescription className="text-base">
            Enter your email to receive a secure link to access, download, or
            delete your personal data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CustomFormField
                type="email"
                control={form.control}
                name="email"
                label="Email Address"
                placeholder="john@example.com"
                required
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Secure Link <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-4">
                By continuing, you agree to our{" "}
                <Link
                  href="/privacy-policy"
                  className="underline hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
