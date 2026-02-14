"use client";

import { PageWrapper } from "@/components/landing/page-wrapper";
import { Button } from "@workspace/ui/components/button";
import { Mail, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function ContactUsPage() {
  return (
    <PageWrapper className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 md:py-24">
      <div className="container max-w-5xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="flex flex-col items-start space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground/50 via-foreground to-foreground/50">
                Get in touch
              </h1>
              <p className="max-w-[600px] text-zinc-500 md:text-xl dark:text-zinc-400">
                Have a question or feedback? We&apos;d love to hear from you.
                Our team is ready to help you get the most out of Tresta.
              </p>
            </div>

            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              What we can help with
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "Platform usage and features",
                "Billing and payments",
                "Technical support",
                "Feedback and suggestions",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Card className="border border-border bg-card/50 backdrop-blur-sm p-8 shadow-2xl transition-all hover:border-primary/20 hover:shadow-primary/5">
            <CardHeader className="mb-6 flex h-12 w-12 items-center justify-center bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </CardHeader>

            <CardTitle className="text-2xl font-bold">Email Support</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              For general inquiries, technical support, and billing questions.
            </CardDescription>

            <CardContent className="mt-8">
              <Button size="lg" className="w-full gap-2 text-base h-12" asChild>
                <Link href="mailto:support@tresta.app">
                  support@tresta.app
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                We usually respond within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
