"use client";

import React, { useState } from "react";
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
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS
} from "@workspace/ui/components/input-otp";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormHandleSubmit } from "react-hook-form";

import {
  FaGithub,
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaChevronLeft
} from "react-icons/fa";
import Link from "next/link";

const signUpFormSchema = z.object({
  email: z.string().min(2, { message: "Email is required" }).email(),
  password: z.string().min(6, { message: "Password is required" })
});

const codeFormSchema = z.object({
  code: z.string().min(6, { message: "Code is required" }).max(6)
});

const SignUpForm = () => {
  const { signUp, setActive } = useSignUp();

  const [authStep, setAuthStep] = useState<"email" | "code">("email");
  const [showPassword, setShowPassword] = useState(false);

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
    setAuthStep("code");
  };

  const onSubmitCode = async (data: z.infer<typeof codeFormSchema>) => {
    setAuthStep("email");
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
            <Button variant={"secondary"} className="flex-1 px-2">
              <FaGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <Button variant={"secondary"} className="flex-1 px-2">
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
              <Button className="w-full" type="submit">
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

            <Button variant={"link"}>Resend Code</Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
