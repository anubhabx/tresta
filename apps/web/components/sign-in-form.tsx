"use client";

import React, { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
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
  InputOTPSeparator,
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

const SignInFormSchema = z.object({
  email: z.string().min(2, { message: "Email is required" }).email(),
  password: z.string().min(6, { message: "Password is required" })
});

const SignInForm = () => {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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

  const SignInForm = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
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
        password: data.password
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
            <FormField
              control={SignInForm.control}
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
              control={SignInForm.control}
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
