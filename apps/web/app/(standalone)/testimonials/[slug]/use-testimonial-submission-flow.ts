"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import type { CredentialResponse } from "@react-oauth/google";
import type { ApiResponse, CreateTestimonialPayload, Project } from "@/types/api";
import { getPublicApiBaseUrl } from "@/config/env";
import { getHttpErrorMessage } from "@/lib/errors/http-error";
import {
  testimonialFormSchema,
  type TestimonialFormData,
} from "@/components/collection-form";

type CreateTestimonialPayloadWithGoogle = CreateTestimonialPayload & {
  googleIdToken?: string;
};

type TestimonialErrorResponse = {
  message?: string;
  error?: {
    message?: string;
    details?: {
      createdAt?: string;
    };
  };
  data?: {
    createdAt?: string;
  };
};

const publicApi = axios.create({
  baseURL: getPublicApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export function useTestimonialSubmissionFlow(slug: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);
  const [existingSubmissionCreatedAt, setExistingSubmissionCreatedAt] =
    useState<string | undefined>(undefined);
  const [googleIdToken, setGoogleIdToken] = useState<string | null>(null);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);
  const [isVideoSectionOpen, setIsVideoSectionOpen] = useState(false);
  const [fingerprintOptOut, setFingerprintOptOut] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const requireVideoUrl =
    isVideoEnabled && project?.formConfig?.requireVideoUrl === true;
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

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        toast.error("Failed to get Google credentials");
        return;
      }

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
          .map((char) =>
            `%${("00" + char.charCodeAt(0).toString(16)).slice(-2)}`,
          )
          .join(""),
      );

      const payload = JSON.parse(jsonPayload) as {
        name?: string;
        email?: string;
        picture?: string;
      };

      form.setValue("authorName", payload.name || "");
      form.setValue("authorEmail", payload.email || "");
      form.setValue("authorAvatar", payload.picture || "");

      setGoogleIdToken(credentialResponse.credential);
      setIsGoogleVerified(true);

      toast.success("Verified with Google! Your info has been auto-filled.");
    } catch (error) {
      console.error("Failed to decode Google token:", error);
      toast.error("Failed to verify with Google. Please try again.");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-In was unsuccessful. Please try again.");
  };

  const validateConfigRequirements = (data: TestimonialFormData) => {
    const fc = project?.formConfig;
    const chkRating = fc?.enableRating !== false && fc?.requireRating === true;
    const chkJobTitle =
      fc?.enableJobTitle !== false && fc?.requireJobTitle === true;
    const chkCompany =
      fc?.enableCompany !== false && fc?.requireCompany === true;
    const chkAvatar = fc?.enableAvatar !== false && fc?.requireAvatar === true;
    const chkVideo =
      fc?.enableVideoUrl !== false && fc?.requireVideoUrl === true;
    const chkGoogle =
      fc?.enableGoogleVerification !== false &&
      fc?.requireGoogleVerification === true;

    let hasValidationError = false;
    form.clearErrors([
      "rating",
      "authorRole",
      "authorCompany",
      "authorAvatar",
      "videoUrl",
    ]);

    if (chkRating && (!data.rating || data.rating < 1)) {
      form.setError("rating", {
        type: "manual",
        message: "Rating is required for this form.",
      });
      hasValidationError = true;
    }

    if (chkJobTitle && !data.authorRole?.trim()) {
      form.setError("authorRole", {
        type: "manual",
        message: "Role is required for this form.",
      });
      hasValidationError = true;
    }

    if (chkCompany && !data.authorCompany?.trim()) {
      form.setError("authorCompany", {
        type: "manual",
        message: "Company is required for this form.",
      });
      hasValidationError = true;
    }

    if (chkAvatar && !data.authorAvatar?.trim()) {
      form.setError("authorAvatar", {
        type: "manual",
        message: "Profile picture is required for this form.",
      });
      hasValidationError = true;
    }

    if (chkVideo && !data.videoUrl?.trim()) {
      form.setError("videoUrl", {
        type: "manual",
        message: "Video URL is required for this form.",
      });
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

  const executeSubmission = async (data: TestimonialFormData) => {
    setIsSubmitting(true);

    try {
      const payload: CreateTestimonialPayloadWithGoogle = {
        authorName: data.authorName,
        content: data.content,
        type: "TEXT",
      };

      if (data.authorEmail) payload.authorEmail = data.authorEmail;
      if (data.authorRole) payload.authorRole = data.authorRole;
      if (data.authorCompany) payload.authorCompany = data.authorCompany;
      if (data.authorAvatar) payload.authorAvatar = data.authorAvatar;
      if (data.rating) payload.rating = data.rating;

      if (data.videoUrl) {
        payload.videoUrl = data.videoUrl;
        payload.type = "VIDEO";
      }

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
        toast.success("Thank you! Your testimonial has been submitted anonymously.");
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
          axiosError?.response?.data?.error?.message ||
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
          getHttpErrorMessage(
            error,
            "Failed to submit testimonial. Please try again.",
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: TestimonialFormData) => {
    if (!validateConfigRequirements(data)) {
      return;
    }
    await executeSubmission(data);
  };

  const formattedExistingDate = useMemo(
    () =>
      existingSubmissionCreatedAt
        ? new Intl.DateTimeFormat(undefined, {
            dateStyle: "long",
            timeStyle: "short",
          }).format(new Date(existingSubmissionCreatedAt))
        : null,
    [existingSubmissionCreatedAt],
  );

  return {
    form,
    project,
    isLoading,
    isSubmitting,
    isSuccess,
    hasExistingSubmission,
    formattedExistingDate,
    isGoogleVerified,
    isVideoSectionOpen,
    fingerprintOptOut,
    handleGoogleSuccess,
    handleGoogleError,
    setIsVideoSectionOpen,
    setFingerprintOptOut,
    onFormSubmit: form.handleSubmit(onSubmit),
  };
}
