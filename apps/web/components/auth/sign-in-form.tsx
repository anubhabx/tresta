"use client";

import React, { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { InlineLoader } from "../loader";
import { CustomFormField } from "@/components/forms/fields/custom-form-field";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

const SignInFormSchema = z.object({
  email: z.string().min(2, { message: "Email is required" }).email(),
  password: z.string().min(6, { message: "Password is required" }),
});

const SignInForm = () => {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmitSignIn = async (data: z.infer<typeof SignInFormSchema>) => {
    if (data.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (form.formState.errors.email) {
      toast.error(form.formState.errors.email.message);
      return;
    }

    if (form.formState.errors.password) {
      toast.error(form.formState.errors.password.message);
      return;
    }

    try {
      setLoading(true);
      const completeSignIn = await signIn?.create({
        identifier: data.email,
        password: data.password,
      });

      if (!completeSignIn) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      await setActive?.({ session: completeSignIn.createdSessionId });
      toast.success("Signed in successfully!");
      router.push(redirectUrl || "/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }

      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onOAuthSignIn = (provider: "google" | "github") => {
    const finalRedirect = redirectUrl || "/dashboard";
    void signIn?.authenticateWithRedirect({
      strategy: `oauth_${provider}`,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: `${window.location.origin}${finalRedirect.startsWith("/") ? finalRedirect : "/" + finalRedirect}`,
    });
  };

  return (
    <div className="w-full">
      {/* Mobile-only logo */}
      <div className="flex items-center gap-2.5 mb-8 lg:hidden">
        <Image
          src="/branding/tresta.svg"
          alt="Tresta"
          width={24}
          height={24}
          className="shrink-0"
        />
        <span className="text-base font-semibold tracking-tight">Tresta</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to your Tresta dashboard.
        </p>
      </div>

      {/* OAuth */}
      <OAuthButtons onOAuthClick={onOAuthSignIn} />

      {/* Divider */}
      <div className="flex gap-3 items-center my-6">
        <hr className="flex-1 border-border" />
        <span className="text-xs text-muted-foreground">
          or continue with email
        </span>
        <hr className="flex-1 border-border" />
      </div>

      {/* Email / password form */}
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit(onSubmitSignIn)(e);
          }}
        >
          <CustomFormField
            type="email"
            control={form.control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            required
          />

          <CustomFormField
            type="password"
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
          />

          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <InlineLoader className="mr-2 h-4 w-4" />}
            Continue
          </Button>
        </form>
      </Form>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Forgot password?
        </button>

        <span className="text-muted-foreground">
          No account?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default SignInForm;
