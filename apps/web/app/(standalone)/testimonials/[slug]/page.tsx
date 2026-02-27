"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Ban, CheckCircle2, Linkedin, Twitter } from "lucide-react";
import axios from "axios";
import { motion } from "motion/react";
import type { ApiResponse, CreateTestimonialPayload, Project } from "@/types/api";
import { GoogleOAuthProvider } from "@/components/google-oauth-provider";
import type { CredentialResponse } from "@react-oauth/google";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { CollectionPageShell } from "@/components/testimonials/collection-page-shell";
import {
  CollectionFormBody,
  testimonialFormSchema,
  type TestimonialFormData,
} from "@/components/collection-form";

// Public API client (no credentials/cookie, no auth header)
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

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
  const [isVideoSectionOpen, setIsVideoSectionOpen] = useState(false);
  const [fingerprintOptOut, setFingerprintOptOut] = useState(false);

  const form = useForm<TestimonialFormData>({
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

  const isVideoEnabled = project?.formConfig?.enableVideoUrl !== false;
  const requireVideoUrl = isVideoEnabled && project?.formConfig?.requireVideoUrl === true;
  const allowFingerprintOptOut =
    project?.formConfig?.allowFingerprintOptOut === true;

  useEffect(() => {
    if (!isVideoEnabled) {
      setIsVideoSectionOpen(false);
      return;
    }

    if (requireVideoUrl) {
      setIsVideoSectionOpen(true);
    }
  }, [isVideoEnabled, requireVideoUrl]);

  useEffect(() => {
    if (!allowFingerprintOptOut) {
      setFingerprintOptOut(false);
    }
  }, [allowFingerprintOptOut]);

  const handleGoogleError = () => {
    toast.error("Google Sign-In was unsuccessful. Please try again.");
  };

  const validateConfigRequirements = (data: TestimonialFormData) => {
    const fc = project?.formConfig;
    const chkRating = fc?.enableRating !== false && fc?.requireRating === true;
    const chkJobTitle = fc?.enableJobTitle !== false && fc?.requireJobTitle === true;
    const chkCompany = fc?.enableCompany !== false && fc?.requireCompany === true;
    const chkAvatar = fc?.enableAvatar !== false && fc?.requireAvatar === true;
    const chkVideo = fc?.enableVideoUrl !== false && fc?.requireVideoUrl === true;
    const chkGoogle =
      fc?.enableGoogleVerification !== false &&
      fc?.requireGoogleVerification === true;

    let hasValidationError = false;
    form.clearErrors(["rating", "authorRole", "authorCompany", "authorAvatar", "videoUrl"]);

    if (chkRating && (!data.rating || data.rating < 1)) {
      form.setError("rating", { type: "manual", message: "Rating is required for this form." });
      hasValidationError = true;
    }
    if (chkJobTitle && !data.authorRole?.trim()) {
      form.setError("authorRole", { type: "manual", message: "Role is required for this form." });
      hasValidationError = true;
    }
    if (chkCompany && !data.authorCompany?.trim()) {
      form.setError("authorCompany", { type: "manual", message: "Company is required for this form." });
      hasValidationError = true;
    }
    if (chkAvatar && !data.authorAvatar?.trim()) {
      form.setError("authorAvatar", { type: "manual", message: "Profile picture is required for this form." });
      hasValidationError = true;
    }
    if (chkVideo && !data.videoUrl?.trim()) {
      form.setError("videoUrl", { type: "manual", message: "Video URL is required for this form." });
      hasValidationError = true;
    }
    if (chkGoogle && !isGoogleVerified) {
      toast.error("Google verification is required before submitting.");
      hasValidationError = true;
    }
    if (hasValidationError) {
      toast.error("Please complete all required fields before submitting.");
    }
    return !hasValidationError;
  };

  const onSubmit = async (data: TestimonialFormData) => {
    if (!validateConfigRequirements(data)) {
      return;
    }
    await executeSubmission(data);
  };

  const executeSubmission = async (data: TestimonialFormData) => {
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
      if (fingerprintOptOut && allowFingerprintOptOut) {
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

      if (fingerprintOptOut) {
        toast.success(
          "Thank you! Your testimonial has been submitted anonymously.",
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
      <CollectionPageShell centered>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="w-full border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardContent className="card-spacious text-center stack-loose">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Ban className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-3">
                  Already Submitted
                </h1>
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
      </CollectionPageShell>
    );
  }

  if (isSuccess) {
    return (
      <CollectionPageShell centered>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full"
        >
          <Card className="w-full border-border/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CardContent className="card-spacious text-center">
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
                <h1 className="text-3xl font-semibold tracking-tight mb-3">
                  {project?.formConfig?.thankYouMessage
                    ? "Thank You!"
                    : "Thank You!"}
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  {project?.formConfig?.thankYouMessage ||
                    "Your testimonial has been submitted and is pending review. We truly appreciate your feedback!"}
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
      </CollectionPageShell>
    );
  }

  if (isLoading) {
    return (
      <CollectionPageShell>
        <Card className="w-full border-border/60 bg-card shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-5 px-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2.5 w-full max-w-xs mx-auto">
                <div className="h-7 bg-muted animate-pulse rounded mx-auto w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded mx-auto w-full" />
              </div>
            </div>
          </CardHeader>
          <div className="px-6 pb-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
            ))}
            <div className="h-24 bg-muted animate-pulse rounded-md" />
            <div className="h-12 bg-muted animate-pulse rounded-xl" />
          </div>
        </Card>
      </CollectionPageShell>
    );
  }

  return (
    <GoogleOAuthProvider>
      <CollectionPageShell>
        <CollectionFormBody
          mode="hosted"
          formConfig={project?.formConfig}
          projectName={project?.name}
          projectTagline={project?.shortDescription}
          projectDescription={project?.description}
          logoUrl={project?.logoUrl}
          brandColorPrimary={project?.brandColorPrimary}
          form={form}
          isSubmitting={isSubmitting}
          isGoogleVerified={isGoogleVerified}
          onGoogleSuccess={handleGoogleSuccess}
          onGoogleError={handleGoogleError}
          isVideoOpen={isVideoSectionOpen}
          onVideoOpenChange={setIsVideoSectionOpen}
          fingerprintOptOut={fingerprintOptOut}
          onFingerprintOptOutChange={setFingerprintOptOut}
          onFormSubmit={form.handleSubmit(onSubmit)}
        />
      </CollectionPageShell>
    </GoogleOAuthProvider>
  );
}
