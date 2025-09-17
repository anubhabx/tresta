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
  FormLabel,
  FormMessage
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
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

import {
  FaGithub,
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaChevronLeft
} from "react-icons/fa";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="flex gap-2 items-center justify-center">
            <Button
              variant={"secondary"}
              className="flex-1 px-2"
              onClick={() => onOAuthSignUp("google")}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <Button
              variant={"secondary"}
              className="flex-1 px-2"
              onClick={() => onOAuthSignUp("github")}
            >
              <FaGithub className="mr-2 h-4 w-4" />
              Continue with Github
            </Button>
          </div>
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
              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                        />
                        {showPassword ? (
                          <FaEyeSlash
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            title="Hide password"
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <FaEye
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                            title="Show password"
                            onClick={() => setShowPassword(true)}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

              <Button className="w-full" type="submit">
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
