"use client";

import React, { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InlineLoader } from "./loader";
import { CustomFormField } from "./custom-form-field";
import { OAuthButtons } from "./auth/oauth-buttons";

const SignInFormSchema = z.object({
  email: z.string().min(2, { message: "Email is required" }).email(),
  password: z.string().min(6, { message: "Password is required" }),
});

const SignInForm = () => {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

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

  const SignInForm = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmitSignIn = async (data: z.infer<typeof SignInFormSchema>) => {
    console.log("Sign Up Data:", data);

    if (data.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (SignInForm.formState.errors.email) {
      toast.error(SignInForm.formState.errors.email.message);
      return;
    }

    if (SignInForm.formState.errors.password) {
      toast.error(SignInForm.formState.errors.password.message);
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

      toast.success("Signed in successfully!");
      router.push("/dashboard");
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

  const onOAuthSignUp = (provider: "google" | "github") => {
    void signIn?.authenticateWithRedirect({
      strategy: `oauth_${provider}`,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <Card className="min-w-[350px] text-center">
      <CardHeader>
        <CardTitle className="text-lg">Create Account</CardTitle>
        <CardDescription>Sign up to get stared with Tresta</CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons onOAuthClick={onOAuthSignUp} />

        <div className="flex gap-2 items-center my-4">
          <hr className="flex-1 border-border" />
          <span className="text-sm text-muted-foreground">OR</span>
          <hr className="flex-1 border-border" />
        </div>

        <Form {...SignInForm}>
          <form
            className="space-y-4 text-justify"
            onSubmit={(e) => {
              e.preventDefault();
              void SignInForm.handleSubmit(onSubmitSignIn)(e);
            }}
          >
            <CustomFormField
              type="email"
              control={SignInForm.control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              required
            />

            <CustomFormField
              type="password"
              control={SignInForm.control}
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
      </CardContent>

      <Separator />

      <CardFooter className="text-sm w-full justify-between">
        <div className="text-primary hover:underline hover:underline-offset-4 cursor-pointer">
          Forgot password?
        </div>

        <div>
          Don&apos;t have an account?
          <Link
            href="/sign-up"
            className="text-primary ml-1 hover:underline hover:underline-offset-4"
          >
            Sign Up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;
