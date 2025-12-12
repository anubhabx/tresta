"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Ban, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";
import axios from "axios";
import type { ApiResponse, CreateTestimonialPayload, Project } from "@/types/api";
import { AzureFileUpload } from "@/components/azure-file-upload";
import { GoogleOAuthProvider } from "@/components/google-oauth-provider";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

import { Form } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { CustomFormField } from "@/components/custom-form-field";
import { Badge } from "@workspace/ui/components/badge";

// Public API client (no credentials/cookie, no auth header)
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

const testimonialFormSchema = z.object({
  authorName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(255, { message: "Name must be less than 255 characters" }),
  authorEmail: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional()
    .or(z.literal("")),
  authorRole: z
    .string()
    .max(255, { message: "Role must be less than 255 characters" })
    .optional()
    .or(z.literal("")),
  authorCompany: z
    .string()
    .max(255, { message: "Company must be less than 255 characters" })
    .optional()
    .or(z.literal("")),
  authorAvatar: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(10, { message: "Please write at least 10 characters" })
    .max(2000, { message: "Testimonial must be less than 2000 characters" }),
  rating: z.number().min(1).max(5).optional(),
  videoUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof testimonialFormSchema>;

interface TestimonialSubmissionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TestimonialSubmissionPage({
  params,
}: TestimonialSubmissionPageProps) {
  const { slug } = use(params);
  // const api = useApi(); // Removed to avoid CORS issues with credentials
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);
  const [existingSubmissionCreatedAt, setExistingSubmissionCreatedAt] =
    useState<string | undefined>(undefined);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      authorRole: "",
      authorCompany: "",
      authorAvatar: "",
      content: "",
      rating: 0,
      videoUrl: "",
    },
  });

  // Handle Google Sign-In success
  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        toast.error("Failed to get Google credentials");
        return;
      }

      // Decode the JWT token to get user info
      const tokenParts = credentialResponse.credential.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
      }

      const base64Url = tokenParts[1];
      if (!base64Url) {
        throw new Error("Invalid token payload");
      }

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      const payload = JSON.parse(jsonPayload);

      // Auto-fill form fields from Google profile
      form.setValue("authorName", payload.name || "");
      form.setValue("authorEmail", payload.email || "");
      form.setValue("authorAvatar", payload.picture || "");

      // Store the ID token for backend verification
      setGoogleIdToken(credentialResponse.credential);
      setIsGoogleVerified(true);

      toast.success("Verified with Google! Your info has been auto-filled.");
    } catch (error) {
      console.error("Failed to decode Google token:", error);
      toast.error("Failed to verify with Google. Please try again.");
    }
  };

  // Fetch project details
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await publicApi.get<ApiResponse<Project>>(
          `/api/public/projects/${slug}`,
        );
        setProject(res.data.data);
      } catch (error) {
        console.error("Failed to fetch project:", error);
        toast.error("Failed to load project details");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  // Handle Google Sign-In error
  const handleGoogleError = () => {
    toast.error("Google Sign-In was unsuccessful. Please try again.");
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload: CreateTestimonialPayload = {
        authorName: data.authorName,
        content: data.content,
        type: "TEXT",
      };

      if (data.authorEmail) {
        payload.authorEmail = data.authorEmail;
      }

      if (data.authorRole) {
        payload.authorRole = data.authorRole;
      }

      if (data.authorCompany) {
        payload.authorCompany = data.authorCompany;
      }

      if (data.authorAvatar) {
        payload.authorAvatar = data.authorAvatar;
      }

      if (data.rating) {
        payload.rating = data.rating;
      }

      if (data.videoUrl) {
        payload.videoUrl = data.videoUrl;
        payload.type = "VIDEO";
      }

      // Include Google ID token if user signed in with Google
      if (googleIdToken) {
        (payload as any).googleIdToken = googleIdToken;
      }

      await publicApi.post<ApiResponse<unknown>>(
        `/api/public/projects/${slug}/testimonials`,
        payload,
      );

      setIsSuccess(true);
      form.reset();
      setGoogleIdToken(null);
      setIsGoogleVerified(false);
      toast.success("Thank you! Your testimonial has been submitted.");
    } catch (error: any) {
      console.error("Failed to submit testimonial:", error);
      const status = error?.response?.status;
      if (status === 409) {
        const responseMessage =
          error?.response?.data?.message ||
          "It looks like you've already shared your experience.";
        const details =
          error?.response?.data?.error?.details ||
          error?.response?.data?.data;

        if (details?.createdAt) {
          setExistingSubmissionCreatedAt(details.createdAt);
        } else {
          setExistingSubmissionCreatedAt(undefined);
        }

        setHasExistingSubmission(true);
        toast.info(responseMessage);
      } else {
        toast.error(
          error?.response?.data?.message ||
          "Failed to submit testimonial. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedExistingDate = existingSubmissionCreatedAt
    ? new Intl.DateTimeFormat(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(existingSubmissionCreatedAt))
    : null;

  if (hasExistingSubmission) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Ban className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-3">
                Testimonial Already Submitted
              </h1>
              <p className="text-lg text-muted-foreground">
                Thanks again for your enthusiasm! Each customer can submit
                one testimonial per project, and we already have yours on
                file.
              </p>
            </div>
            {formattedExistingDate && (
              <p className="text-sm text-muted-foreground">
                Submitted on {formattedExistingDate}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href={`/testimonials/${slug}`}>
                  View Other Testimonials
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-dashed"
              >
                <a href="mailto:support@tresta.app?subject=Testimonial%20Update">
                  Need to update yours?
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-success-muted">
                <CheckCircle2 className="h-16 w-16 text-success" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3">Thank You!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your testimonial has been submitted successfully. We truly
              appreciate your feedback!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider>
      <div className="min-h-screen flex items-center justify-center p-4 w-full">
        <Card className="max-w-6xl w-full">
          <CardHeader className="space-y-1 pb-6">
            {isLoading ? (
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-2">
                {project?.logoUrl ? (
                  <img
                    src={project.logoUrl}
                    alt={`${project.name} Logo`}
                    className="h-12 w-12 object-contain rounded-lg bg-white p-1 border"
                  />
                ) : (
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: project?.brandColorPrimary
                        ? `${project.brandColorPrimary}15` // 10% opacity
                        : "hsl(var(--primary) / 0.1)",
                    }}
                  >
                    <MessageSquare
                      className="h-6 w-6"
                      style={{
                        color: project?.brandColorPrimary || "hsl(var(--primary))",
                      }}
                    />
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Share Your Experience with {project?.name || "Us"}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Your feedback helps us improve and inspires others
                  </CardDescription>
                </div>
              </div>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Google Sign-In Section */}
                {!isGoogleVerified && (
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">
                        Verify with Google (Recommended)
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sign in with Google to auto-fill your information and add
                      a verified badge to your testimonial
                    </p>
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                      />
                    </div>
                  </div>
                )}

                {/* Verified Badge */}
                {isGoogleVerified && (
                  <div className="bg-success-muted border border-border rounded-lg p-4 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <div className="flex-1">
                      <p className="font-medium">
                        Verified with Google
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your testimonial will display a verified badge
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-success text-success-foreground"
                    >
                      Verified
                    </Badge>
                  </div>
                )}

                {isGoogleVerified && <Separator />}

                {/* Name Field */}
                <CustomFormField
                  type="text"
                  control={form.control}
                  name="authorName"
                  label="Your Name"
                  placeholder="John Doe"
                  required
                />

                {/* Email Field */}
                <CustomFormField
                  type="email"
                  control={form.control}
                  name="authorEmail"
                  label="Email Address"
                  placeholder="john@example.com"
                  description="We'll never share your email or send spam"
                  optional
                />

                {/* Role Field */}
                <CustomFormField
                  type="text"
                  control={form.control}
                  name="authorRole"
                  label="Your Role"
                  placeholder="e.g., CEO, Marketing Manager, Developer"
                  description="Your job title or role"
                  optional
                />

                {/* Company Field */}
                <CustomFormField
                  type="text"
                  control={form.control}
                  name="authorCompany"
                  label="Company Name"
                  placeholder="e.g., Acme Inc."
                  description="The company or organization you represent"
                  optional
                />

                {/* Avatar Upload - only show if not using Google */}
                {!isGoogleVerified && (
                  <div className="space-y-2">
                    <AzureFileUpload
                      control={form.control}
                      name="authorAvatar"
                      label="Profile Picture (Optional)"
                      directory="avatars"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      maxSizeMB={2}
                      description="JPG, PNG, or WebP (max 2MB)"
                    />
                  </div>
                )}

                <Separator className="my-6" />

                {/* Rating Field */}
                <CustomFormField
                  type="rating"
                  control={form.control}
                  name="rating"
                  label="Rating"
                  description="How would you rate your experience?"
                  max={5}
                  optional
                />

                {/* Content Field */}
                <CustomFormField
                  type="textarea"
                  control={form.control}
                  name="content"
                  label="Your Testimonial"
                  placeholder="Share your experience, what you liked, and how it helped you..."
                  maxLength={2000}
                  showCharacterCount
                  required
                />

                {/* Video URL Field */}
                <CustomFormField
                  type="url"
                  control={form.control}
                  name="videoUrl"
                  label="Video Testimonial URL"
                  placeholder="https://youtube.com/watch?v=..."
                  description="Add a link to your video testimonial (YouTube, Vimeo, etc.)"
                  optional
                />

                <Separator className="my-6" />

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  style={
                    project?.brandColorPrimary
                      ? { backgroundColor: project.brandColorPrimary }
                      : undefined
                  }
                >
                  {isSubmitting ? "Submitting..." : "Submit Testimonial"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Your testimonial will be reviewed before being published
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
}
