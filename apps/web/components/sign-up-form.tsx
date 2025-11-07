"use client";

import React, { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@workspace/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS
} from "@workspace/ui/components/input-otp";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FaChevronLeft } from "react-icons/fa";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InlineLoader } from "./loader";
import { CustomFormField } from "./custom-form-field";
import { OAuthButtons } from "./auth/oauth-buttons";

const signUpFormSchema = z.object({
  email: z.string().min(2, { message: "Email is required" }).email(),
  password: z.string().min(6, { message: "Password is required" })
});

const codeFormSchema = z.object({
  code: z.string().min(6, { message: "Code is required" }).max(6)
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
      password: ""
    }
  });

  const codeForm = useForm<z.infer<typeof codeFormSchema>>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: {
      code: ""
    }
  });

  const onSubmitSignUp = async (data: z.infer<typeof signUpFormSchema>) => {
    console.log("Sign Up Data:", data);

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
        password: data.password
      });

      if (!completeSignUp) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      await completeSignUp.prepareEmailAddressVerification({
        strategy: "email_code"
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
    console.log("Code Data:", data);

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
        code: data.code
      });

      if (!completeSignUp) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      await setActive({ session: completeSignUp.createdSessionId });
      router.push("/dashboard");
      toast.success("Email verification successful!");
    } catch (error) {
      toast.error("Invalid code. Please try again.");
      return;
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (resendCooldown > 0) {
      return;
    }

    try {
      setLoading(true);
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code"
      });
      toast.success("Verification code resent to your email.");
      setResendCooldown(60);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onOAuthSignUp = (provider: "google" | "github") => {
    void signUp?.authenticateWithRedirect({
      strategy: `oauth_${provider}`,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: `${window.location.origin}/dashboard`
    });
  };

  return (
    <Card className="min-w-[350px] text-center">
      <CardHeader>
        <CardTitle className="text-lg">Create Account</CardTitle>
        <CardDescription>Sign up to get stared with Tresta</CardDescription>
      </CardHeader>
      <CardContent>
        {authStep === "email" && (
          <OAuthButtons onOAuthClick={onOAuthSignUp} />
        )}

        <div className="flex gap-2 items-center my-4">
          <hr className="flex-1 border-border" />
          <span className="text-sm text-muted-foreground">OR</span>
          <hr className="flex-1 border-border" />
        </div>

        {authStep === "email" && (
          <Form {...signUpForm}>
            <form
              className="space-y-4 text-justify"
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
                placeholder="Enter your email"
                required
              />

              <CustomFormField
                type="password"
                control={signUpForm.control}
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
        )}

        {authStep === "code" && (
          <Form {...codeForm}>
            <form
              className="space-y-4 flex flex-col items-center text-center"
              onSubmit={(e) => {
                e.preventDefault();
                void codeForm.handleSubmit(onSubmitCode)(e);
              }}
            >
              <p className="text-sm text-center text-muted-foreground">
                Enter the 6-digit code we sent to your email address.
              </p>
              <p className="text-sm text-center text-semibold">
                {signUpForm.getValues().email}
              </p>
              <FormField
                control={codeForm.control}
                name="code"
                render={({ field }) => {
                  return (
                    <FormItem className="w-full">
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          {...field}
                          pattern={REGEXP_ONLY_DIGITS}
                          className="w-full"
                        >
                          <InputOTPGroup className="w-full justify-center">
                            <InputOTPSlot index={0} className="flex-1" />
                            <InputOTPSlot index={1} className="flex-1" />
                            <InputOTPSlot index={2} className="flex-1" />
                            <InputOTPSlot index={3} className="flex-1" />
                            <InputOTPSlot index={4} className="flex-1" />
                            <InputOTPSlot index={5} className="flex-1" />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <InlineLoader className="mr-2 h-4 w-4" />}
                Verify Code
              </Button>
            </form>
          </Form>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="text-sm w-full justify-center">
        {authStep === "email" && (
          <>
            Already have an account?
            <Link
              href="/sign-in"
              className="text-primary ml-1 hover:underline hover:underline-offset-4"
            >
              Sign In
            </Link>
          </>
        )}

        {authStep === "code" && (
          <div className="flex justify-between w-full">
            <Button variant={"ghost"} onClick={() => setAuthStep("email")}>
              <FaChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              variant={"link"}
              onClick={onResendCode}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Resend Code in ${resendCooldown}s`
                : "Resend Code"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
