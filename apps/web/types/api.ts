export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta: {
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: {
    timestamp: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export enum ProjectType {
  SAAS_APP = "SAAS_APP",
  PORTFOLIO = "PORTFOLIO",
  MOBILE_APP = "MOBILE_APP",
  CONSULTING_SERVICE = "CONSULTING_SERVICE",
  E_COMMERCE = "E_COMMERCE",
  AGENCY = "AGENCY",
  FREELANCE = "FREELANCE",
  PRODUCT = "PRODUCT",
  COURSE = "COURSE",
  COMMUNITY = "COMMUNITY",
  OTHER = "OTHER",
}

export enum ProjectVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  INVITE_ONLY = "INVITE_ONLY",
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface Project {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  slug: string;
  logoUrl: string | null;
  projectType: ProjectType | null;
  websiteUrl: string | null;
  collectionFormUrl: string | null;
  brandColorPrimary: string | null;
  brandColorSecondary: string | null;
  socialLinks: SocialLinks | null;
  tags: string[];
  visibility: ProjectVisibility;
  isActive: boolean;
  // Auto-Moderation Settings
  autoModeration?: boolean;
  autoApproveVerified?: boolean;
  profanityFilterLevel?: string | null;
  moderationSettings?: {
    minContentLength?: number;
    maxUrlCount?: number;
    allowedDomains?: string[];
    blockedDomains?: string[];
    customProfanityList?: string[];
    brandKeywords?: string[];
  } | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    testimonials: number;
    widgets?: number;
  };
}

export enum TestimonialStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ModerationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FLAGGED = "FLAGGED",
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorEmail: string | null;
  authorRole: string | null;
  authorCompany: string | null;
  authorAvatar: string | null;
  content: string;
  type: "TEXT" | "VIDEO" | "AUDIO";
  videoUrl: string | null;
  mediaUrl: string | null;
  rating: number | null;
  isApproved: boolean;
  isPublished: boolean;
  isOAuthVerified: boolean;
  oauthProvider: string | null;
  moderationStatus: ModerationStatus;
  moderationScore: number | null;
  moderationFlags: string[] | null;
  autoPublished: boolean;
  projectId: string | null;
  Project?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ModerationStats {
  total: number;
  pending: number;
  flagged: number;
  approved: number;
  rejected: number;
}

export interface ModerationQueueResponse
  extends PaginatedResponse<Testimonial> {
  meta: {
    timestamp: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    stats?: ModerationStats;
  };
}

export enum WidgetType {
  GRID = "GRID",
  LIST = "LIST",
  MASONRY = "MASONRY",
}

export interface Widget {
  id: string;
  type: WidgetType;
  settings: Record<string, unknown> | null;
  projectId: string;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTestimonialPayload {
  isApproved?: boolean;
  isPublished?: boolean;
  moderationStatus?: ModerationStatus;
}

export interface CreateProjectPayload {
  name: string;
  shortDescription?: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  projectType?: ProjectType;
  websiteUrl?: string;
  collectionFormUrl?: string;
  brandColorPrimary?: string;
  brandColorSecondary?: string;
  socialLinks?: SocialLinks;
  tags?: string[];
  visibility?: ProjectVisibility;
}

export interface UpdateProjectPayload {
  name?: string;
  shortDescription?: string;
  description?: string;
  slug?: string;
  logoUrl?: string;
  projectType?: ProjectType;
  websiteUrl?: string;
  collectionFormUrl?: string;
  brandColorPrimary?: string;
  brandColorSecondary?: string;
  socialLinks?: SocialLinks;
  tags?: string[];
  visibility?: ProjectVisibility;
  isActive?: boolean;
  // Auto-Moderation Settings
  autoModeration?: boolean;
  autoApproveVerified?: boolean;
  profanityFilterLevel?: "STRICT" | "MODERATE" | "LENIENT";
  moderationSettings?: {
    minContentLength?: number;
    maxUrlCount?: number;
    allowedDomains?: string[];
    blockedDomains?: string[];
    customProfanityList?: string[];
    brandKeywords?: string[];
  };
}

export interface CreateTestimonialPayload {
  authorName: string;
  authorEmail?: string;
  authorRole?: string;
  authorCompany?: string;
  authorAvatar?: string;
  content: string;
  rating?: number;
  type?: "TEXT" | "VIDEO" | "AUDIO";
  videoUrl?: string;
}

export interface CreateWidgetPayload {
  projectId: string;
  type: WidgetType;
  settings?: Record<string, unknown>;
}

export interface UpdateWidgetPayload {
  type?: WidgetType;
  settings?: Record<string, unknown>;
}
