"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle2, Star, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import type { ApiResponse, CreateTestimonialPayload } from "@/types/api";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";

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
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      content: "",
      rating: 5,
      videoUrl: "",
    },
  });

  const selectedRating = form.watch("rating") || 0;

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
            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
              size="lg"
            >
              Submit Another Testimonial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Your Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="authorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Email Address
                      <Badge variant="secondary" className="text-xs font-normal">
                        Optional
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      We'll never share your email or send spam
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rating Field */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Rating
                      <Badge variant="secondary" className="text-xs font-normal">
                        Optional
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => field.onChange(rating)}
                            onMouseEnter={() => setHoveredRating(rating)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                rating <= (hoveredRating || selectedRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                        {selectedRating > 0 && (
                          <span className="ml-2 text-sm font-medium text-muted-foreground">
                            {selectedRating} / 5
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      How would you rate your experience?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content Field */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Your Testimonial <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience, what you liked, and how it helped you..."
                        className="min-h-[140px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length} / 2000 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Video URL Field */}
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Video Testimonial URL
                      <Badge variant="secondary" className="text-xs font-normal">
                        Optional
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add a link to your video testimonial (YouTube, Vimeo,
                      etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
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
