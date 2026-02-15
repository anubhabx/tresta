"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Ban,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Star,
  Share2,
  Twitter,
  Linkedin,
  Copy,
  Check,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ApiResponse,
  CreateTestimonialPayload,
  Project,
} from "@/types/api";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Info } from "lucide-react";

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
    .string({ required_error: "Email is required for verification" })
    .email({ message: "Please enter a valid email address" }),
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

type CreateTestimonialPayloadWithGoogle = CreateTestimonialPayload & {
  googleIdToken?: string;
};

type TestimonialErrorResponse = {
  message?: string;
  error?: {
    details?: {
      createdAt?: string;
    };
  };
  data?: {
    createdAt?: string;
  };
};

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

  // Privacy Consent State
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

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
    // Open privacy dialog instead of submitting directly
    setPendingFormData(data);
    setIsPrivacyDialogOpen(true);
  };

  const handlePrivacyChoice = async (consented: boolean) => {
    setIsPrivacyDialogOpen(false);
    if (!pendingFormData) return;

    await executeSubmission(pendingFormData, consented);
  };

  const executeSubmission = async (data: FormData, consented: boolean) => {
    setIsSubmitting(true);
    try {
      const payload: CreateTestimonialPayloadWithGoogle = {
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
        payload.googleIdToken = googleIdToken;
      }

      const headers: Record<string, string> = {};
      if (!consented) {
        headers["x-anonymous-submission"] = "true";
      }

      await publicApi.post<ApiResponse<unknown>>(
        `/api/public/projects/${slug}/testimonials`,
        payload,
        { headers },
      );

      setIsSuccess(true);
      form.reset();
      setGoogleIdToken(null);
      setIsGoogleVerified(false);

      if (!consented) {
        toast.success(
          "Thank you! Your testimonial has been submitted anonymously (no IP/Device data stored).",
        );
      } else {
        toast.success("Thank you! Your testimonial has been submitted.");
      }
    } catch (error: unknown) {
      console.error("Failed to submit testimonial:", error);
      const axiosError = axios.isAxiosError<TestimonialErrorResponse>(error)
        ? error
        : null;
      const status = axiosError?.response?.status;
      if (status === 409) {
        const responseMessage =
          axiosError?.response?.data?.message ||
          "It looks like you've already shared your experience.";
        const details =
          axiosError?.response?.data?.error?.details ||
          axiosError?.response?.data?.data;

        if (details?.createdAt) {
          setExistingSubmissionCreatedAt(details.createdAt);
        } else {
          setExistingSubmissionCreatedAt(undefined);
        }

        setHasExistingSubmission(true);
        toast.info(responseMessage);
      } else {
        toast.error(
          axiosError?.response?.data?.message ||
            "Failed to submit testimonial. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
      setPendingFormData(null);
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-lg w-full">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Ban className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-3">Already Submitted</h1>
                <p className="text-muted-foreground">
                  Thanks for your enthusiasm! We already have your testimonial
                  on file.
                </p>
              </div>
              {formattedExistingDate && (
                <p className="text-sm text-muted-foreground">
                  Submitted on {formattedExistingDate}
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href={`/testimonials/${slug}`}>View Testimonials</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="mailto:support@tresta.app?subject=Testimonial%20Update">
                    Need to update yours?
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="max-w-lg w-full">
            <CardContent className="pt-12 pb-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="flex justify-center mb-6"
              >
                <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-3xl font-bold mb-3">Thank You!</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your testimonial has been submitted and is pending review. We
                  truly appreciate your feedback!
                </p>
              </motion.div>

              {/* Social Sharing */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Share your experience
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const text = `I just shared my testimonial for ${project?.name || "this product"}! 🎉`;
                      const url =
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "";
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                        "_blank",
                      );
                    }}
                    className="h-10 w-10"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const text = `I just shared my testimonial for ${project?.name || "this product"}!`;
                      const url =
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "";
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
                        "_blank",
                      );
                    }}
                    className="h-10 w-10"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>

                {project && (
                  <Button variant="ghost" asChild className="mt-4">
                    <Link href={project.websiteUrl || "/"}>
                      Visit {project.name}
                    </Link>
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider>
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center pb-2">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded mx-auto" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto" />
                </div>
              </div>
            ) : (
              <>
                {project?.logoUrl ? (
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage
                      src={project.logoUrl}
                      alt={`${project.name} Logo`}
                    />
                    <AvatarFallback className="bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div
                    className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      backgroundColor: project?.brandColorPrimary
                        ? `${project.brandColorPrimary}15`
                        : "hsl(var(--primary) / 0.1)",
                    }}
                  >
                    <MessageSquare
                      className="h-6 w-6"
                      style={{
                        color:
                          project?.brandColorPrimary || "hsl(var(--primary))",
                      }}
                    />
                  </div>
                )}
                <CardTitle className="text-2xl">
                  Share your experience
                </CardTitle>
                <CardDescription className="text-base">
                  Tell us about your experience with {project?.name || "us"}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="pt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Google Sign-In Section */}
                {!isGoogleVerified && (
                  <div className="rounded-lg border border-dashed p-4 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Verify with Google (Recommended)
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-fill your info and get a verified badge
                    </p>
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        size="medium"
                        text="continue_with"
                        shape="rectangular"
                      />
                    </div>
                  </div>
                )}

                {/* Verified Badge */}
                {isGoogleVerified && (
                  <div className="bg-success/5 border border-success/20 rounded-lg p-3 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Verified with Google
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-success/10 text-success border-0"
                    >
                      Verified
                    </Badge>
                  </div>
                )}

                <Separator />

                {/* Rating - Centered and prominent */}
                <div className="text-center space-y-2">
                  <CustomFormField
                    type="rating"
                    control={form.control}
                    name="rating"
                    label="How would you rate us?"
                    max={5}
                    optional
                  />
                </div>

                {/* Testimonial Content */}
                <CustomFormField
                  type="textarea"
                  control={form.control}
                  name="content"
                  label="Your testimonial"
                  placeholder="What did you like? How did it help you?"
                  maxLength={2000}
                  showCharacterCount
                  required
                />

                {/* Name & Email side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomFormField
                    type="text"
                    control={form.control}
                    name="authorName"
                    label="Your Name"
                    placeholder="John Doe"
                    required
                  />
                  <CustomFormField
                    type="email"
                    control={form.control}
                    name="authorEmail"
                    label="Email"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Role & Company side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomFormField
                    type="text"
                    control={form.control}
                    name="authorRole"
                    label="Role"
                    placeholder="CEO, Developer, etc."
                    optional
                  />
                  <CustomFormField
                    type="text"
                    control={form.control}
                    name="authorCompany"
                    label="Company"
                    placeholder="Acme Inc."
                    optional
                  />
                </div>

                {/* Avatar Upload - only show if not using Google */}
                {!isGoogleVerified && (
                  <AzureFileUpload
                    control={form.control}
                    name="authorAvatar"
                    label="Profile Picture"
                    directory="avatars"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    maxSizeMB={2}
                    description="Optional · JPG, PNG, or WebP (max 2MB)"
                  />
                )}

                {/* Video URL - collapsed by default */}
                <details className="group">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    + Add video testimonial
                  </summary>
                  <div className="mt-3">
                    <CustomFormField
                      type="url"
                      control={form.control}
                      name="videoUrl"
                      label="Video URL"
                      placeholder="https://youtube.com/watch?v=..."
                      description="YouTube, Vimeo, or Loom link"
                      optional
                    />
                  </div>
                </details>

                <Separator />

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

                {/* Privacy info link */}
                <div className="flex items-center justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <Info className="h-3 w-3" />
                        How we use your data
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>How we use your data</DialogTitle>
                        <DialogDescription>
                          We value your privacy and transparency.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-success" />
                            Publicly Visible
                          </h4>
                          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                            <li>Name, Role & Company</li>
                            <li>Profile Picture</li>
                            <li>Testimonial Content & Video</li>
                          </ul>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-warning" />
                            Kept Private
                          </h4>
                          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                            <li>Email Address (verification only)</li>
                            <li>IP & Device Info (spam prevention)</li>
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Privacy Consent Dialog */}
                <Dialog
                  open={isPrivacyDialogOpen}
                  onOpenChange={setIsPrivacyDialogOpen}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Data Privacy</DialogTitle>
                      <DialogDescription>
                        Choose how you'd like to submit your testimonial.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                      <div className="bg-muted/30 p-4 rounded-lg text-sm">
                        <p>
                          We collect <strong>IP Address</strong> and{" "}
                          <strong>Device Info</strong> to prevent spam. This
                          data is encrypted and never shared.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={() => handlePrivacyChoice(true)}
                          className="w-full gap-2"
                          size="lg"
                        >
                          <ShieldCheck className="h-4 w-4" />I Consent & Submit
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handlePrivacyChoice(false)}
                          className="w-full text-muted-foreground"
                        >
                          Submit Anonymously
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
}
