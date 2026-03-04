"use client";

import React, { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from "@workspace/ui/components/input-otp";
import { Button } from "@workspace/ui/components/button";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FaChevronLeft } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InlineLoader } from "../loader";
import { CustomFormField } from "@/components/forms/fields/custom-form-field";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

const signUpFormSchema = z.object({
  email: z.string().min(2, { message: "Email is required" }).email(),
  password: z.string().min(6, { message: "Password is required" }),
});

const codeFormSchema = z.object({
  code: z.string().min(6, { message: "Code is required" }).max(6),
});

const SignUpForm = () => {
  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState<"email" | "code">("email");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const signUpForm = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const codeForm = useForm<z.infer<typeof codeFormSchema>>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmitSignUp = async (data: z.infer<typeof signUpFormSchema>) => {
    if (data.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (signUpForm.formState.errors.email) {
      toast.error(signUpForm.formState.errors.email.message);
      return;
    }

    if (signUpForm.formState.errors.password) {
      toast.error(signUpForm.formState.errors.password.message);
      return;
    }

    try {
      setLoading(true);
      const completeSignUp = await signUp?.create({
        emailAddress: data.email,
        password: data.password,
      });

      if (!completeSignUp) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      await completeSignUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      toast.success("Verification code sent to your email.");
      setAuthStep("code");
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

  const onSubmitCode = async (data: z.infer<typeof codeFormSchema>) => {
    if (codeForm.formState.errors.code) {
      toast.error(codeForm.formState.errors.code.message);
      return;
    }

    if (!setActive) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    try {
      setLoading(true);
      const completeSignUp = await signUp?.attemptEmailAddressVerification({
        code: data.code,
      });

      if (!completeSignUp) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      await setActive({ session: completeSignUp.createdSessionId });
      router.push("/dashboard");
      toast.success("Email verification successful!");
    } catch {
      toast.error("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      setLoading(true);
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      toast.success("Verification code resent to your email.");
      setResendCooldown(60);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onOAuthSignUp = (provider: "google" | "github") => {
    void signUp?.authenticateWithRedirect({
      strategy: `oauth_${provider}`,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: `${window.location.origin}/dashboard`,
    });
  };

  /* ── Email + password step ─────────────────────────────────────── */
  if (authStep === "email") {
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
            Start collecting testimonials
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Create your free account. No credit card required.
          </p>
        </div>

        {/* OAuth */}
        <OAuthButtons onOAuthClick={onOAuthSignUp} />

        {/* Divider */}
        <div className="flex gap-3 items-center my-6">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted-foreground">
            or continue with email
          </span>
          <hr className="flex-1 border-border" />
        </div>

        {/* Email / password form */}
        <Form {...signUpForm}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void signUpForm.handleSubmit(onSubmitSignUp)(e);
            }}
          >
            <CustomFormField
              type="email"
              control={signUpForm.control}
              name="email"
              label="Email"
              placeholder="you@example.com"
              required
            />

            <CustomFormField
              type="password"
              control={signUpForm.control}
              name="password"
              label="Password"
              placeholder="Create a password"
              required
            />

            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <InlineLoader className="mr-2 h-4 w-4" />}
              Continue
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  /* ── OTP verification step ─────────────────────────────────────── */
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
          Check your inbox
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">
            {signUpForm.getValues().email}
          </span>
        </p>
      </div>

      {/* OTP form */}
      <Form {...codeForm}>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void codeForm.handleSubmit(onSubmitCode)(e);
          }}
        >
          <FormField
            control={codeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    pattern={REGEXP_ONLY_DIGITS}
                    className="w-full"
                  >
                    <InputOTPGroup className="w-full justify-center gap-2">
                      <InputOTPSlot index={0} className="flex-1 h-12 text-lg" />
                      <InputOTPSlot index={1} className="flex-1 h-12 text-lg" />
                      <InputOTPSlot index={2} className="flex-1 h-12 text-lg" />
                      <InputOTPSlot index={3} className="flex-1 h-12 text-lg" />
                      <InputOTPSlot index={4} className="flex-1 h-12 text-lg" />
                      <InputOTPSlot index={5} className="flex-1 h-12 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <InlineLoader className="mr-2 h-4 w-4" />}
            Verify & continue
          </Button>
        </form>
      </Form>

      {/* Footer nav */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1.5 px-0"
          onClick={() => setAuthStep("email")}
        >
          <FaChevronLeft className="h-3 w-3" />
          Back
        </Button>

        <Button
          variant="link"
          size="sm"
          className="px-0 text-muted-foreground"
          onClick={onResendCode}
          disabled={resendCooldown > 0}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </Button>
      </div>
    </div>
  );
};

export default SignUpForm;
