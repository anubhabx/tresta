"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { ApiResponse, CreateTestimonialPayload } from "@/types/api";
import { AzureFileUpload } from "@/components/azure-file-upload";

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
  const api = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

      await api.post<ApiResponse<unknown>>(
        `/projects/${slug}/testimonials`,
        payload
      );

      setIsSuccess(true);
      form.reset();
      toast.success("Thank you! Your testimonial has been submitted.");
    } catch (error: any) {
      console.error("Failed to submit testimonial:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to submit testimonial. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
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
    <div className="min-h-screen flex items-center justify-center p-4 w-full">
      <Card className="max-w-2xl w-full">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Share Your Experience
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Your feedback helps us improve and inspires others
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Avatar Upload */}
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
  );
}
