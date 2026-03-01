import { Button } from "@workspace/ui/components/button";
import { Mail, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Tresta",
  description:
    "Have a question or need support? Get in touch with the Tresta team.",
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] opacity-[0.07]">
        <div className="absolute inset-0 bg-primary rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center py-24 px-4">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Left Column */}
            <div className="flex flex-col items-start space-y-8">
              {/* Eyebrow pill */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-md border border-white/10 bg-white/5 backdrop-blur-sm">
                <span className="text-sm font-medium tracking-tight text-zinc-300">
                  We&apos;re here to help
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-display font-medium text-white leading-[1.1]">
                  Get in touch
                </h1>
                <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
                  Have a question or feedback? We&apos;d love to hear from you.
                  Our team is ready to help you get the most out of Tresta.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-zinc-300 uppercase tracking-wider">
                  <MessageSquare className="h-4 w-4 text-primary" />
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
                      className="flex items-center gap-2 text-sm text-zinc-400"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column — Glass Card */}
            <div className="relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
              {/* Top glow line */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-white/8 text-primary">
                <Mail className="h-5 w-5" />
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Email Support
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                For general inquiries, technical support, and billing questions.
              </p>

              <div className="mt-8">
                <Button
                  size="lg"
                  className="w-full gap-2 text-base h-12 bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)] transition-all"
                  asChild
                >
                  <Link href="mailto:support@tresta.app">
                    support@tresta.app
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-4 text-center text-xs text-zinc-600">
                  We usually respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
