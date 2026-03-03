"use client";

import { use } from "react";
import { GoogleOAuthProvider } from "@/components/auth/google-oauth-provider";
import { CollectionPageShell } from "@/components/testimonials/collection-page-shell";
import {
  CollectionFormBody,
} from "@/components/collection-form";
import { useTestimonialSubmissionFlow } from "./use-testimonial-submission-flow";
import {
  ExistingSubmissionState,
  LoadingSubmissionState,
  SuccessSubmissionState,
} from "./submission-states";

interface TestimonialSubmissionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TestimonialSubmissionPage({
  params,
}: TestimonialSubmissionPageProps) {
  const { slug } = use(params);
  const {
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
    onFormSubmit,
  } = useTestimonialSubmissionFlow(slug);

  if (hasExistingSubmission) {
    return (
      <ExistingSubmissionState
        slug={slug}
        formattedExistingDate={formattedExistingDate}
      />
    );
  }

  if (isSuccess) {
    return <SuccessSubmissionState project={project} />;
  }

  if (isLoading) {
    return <LoadingSubmissionState />;
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
          onFormSubmit={onFormSubmit}
        />
      </CollectionPageShell>
    </GoogleOAuthProvider>
  );
}
