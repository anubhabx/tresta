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

export interface Testimonial {
  id: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  type: "TEXT" | "VIDEO" | "AUDIO";
  videoUrl: string | null;
  mediaUrl: string | null;
  rating: number | null;
  isApproved: boolean;
  isPublished: boolean;
  projectId: string | null;
  Project?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export enum WidgetType {
  GRID = "GRID",
  CAROUSEL = "CAROUSEL",
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
}

export interface CreateWidgetPayload {
  name: string;
  slug: string;
  description?: string;
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
}

export interface CreateTestimonialPayload {
  authorName: string;
  authorEmail?: string;
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
