import * as z from "zod";

export const testimonialFormSchema = z.object({
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

export type TestimonialFormData = z.infer<typeof testimonialFormSchema>;
