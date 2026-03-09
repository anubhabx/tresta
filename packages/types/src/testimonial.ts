export type TestimonialKind = "TEXT" | "VIDEO" | "AUDIO";

export type TestimonialModerationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "FLAGGED";

export interface CanonicalTestimonialDTO {
  id: string;
  authorName: string;
  authorEmail: string | null;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatar: string | null;
  content: string;
  type: TestimonialKind;
  videoUrl: string | null;
  mediaUrl: string | null;
  rating: number | null;
  isApproved: boolean;
  isPublished: boolean;
  isOAuthVerified: boolean;
  oauthProvider: string | null;
  moderationStatus: TestimonialModerationStatus;
  moderationScore: number | null;
  moderationFlags: string[] | null;
  autoPublished: boolean;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialProjectSummaryDTO {
  id: string;
  slug: string;
  name: string;
}

export interface PublicProjectBrandingDTO extends TestimonialProjectSummaryDTO {
  logoUrl: string | null;
  brandColorPrimary: string | null;
  brandColorSecondary: string | null;
}

export interface OwnerTestimonialDTO extends CanonicalTestimonialDTO {
  userId: string | null;
  source: string | null;
  sourceUrl: string | null;
  oembedData: unknown;
  project: TestimonialProjectSummaryDTO;
  moderationContext: {
    needsReview: boolean;
    canAutoPublish: boolean;
  };
}

export interface ModerationTestimonialDTO extends OwnerTestimonialDTO {
  reviewPriority: "high" | "medium" | "low";
}

export type PublicTestimonialDTO = Pick<
  CanonicalTestimonialDTO,
  | "id"
  | "authorName"
  | "authorRole"
  | "authorCompany"
  | "authorAvatar"
  | "content"
  | "rating"
  | "type"
  | "videoUrl"
  | "mediaUrl"
  | "createdAt"
  | "updatedAt"
  | "isOAuthVerified"
  | "oauthProvider"
>;

export interface AdminTestimonialDTO extends OwnerTestimonialDTO {
  ipAddress: string | null;
  userAgent: string | null;
}
