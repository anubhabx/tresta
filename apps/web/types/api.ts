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

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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

export interface UpdateProjectPayload {
  name?: string;
  slug?: string;
  description?: string;
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
