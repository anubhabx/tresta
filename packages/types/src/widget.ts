/**
 * Shared Widget Types
 * Used across API, Web App, and Widget packages
 */

/**
 * Widget layout types
 */
export type WidgetLayout = "carousel" | "grid" | "masonry" | "wall" | "list";

/**
 * Widget theme types
 */
export type WidgetTheme = "light" | "dark" | "auto";

/**
 * Card style types
 */
export type CardStyle = "default" | "minimal" | "bordered";

/**
 * Animation types
 */
export type AnimationType = "fade" | "slide" | "none";

/**
 * Widget Configuration
 * This is the structure stored in the database as JSON
 */
export interface WidgetConfig {
  // Layout & Theme
  layout?: WidgetLayout;
  theme?: WidgetTheme;

  // Colors
  primaryColor?: string;
  secondaryColor?: string;

  // Content Visibility
  showRating?: boolean;
  showDate?: boolean;
  showAvatar?: boolean;
  showAuthorRole?: boolean;
  showAuthorCompany?: boolean;

  // Display Settings
  maxTestimonials?: number;
  columns?: number;
  gap?: number;

  // Styling
  cardStyle?: CardStyle;
  animation?: AnimationType;

  // Carousel Behavior
  autoRotate?: boolean;
  rotateInterval?: number; // milliseconds
  showNavigation?: boolean;
}

/**
 * Default widget configuration values
 */
export const DEFAULT_WIDGET_CONFIG: Required<WidgetConfig> = {
  layout: "grid",
  theme: "light",
  primaryColor: "#0066FF",
  secondaryColor: "#00CC99",
  showRating: true,
  showDate: true,
  showAvatar: false,
  showAuthorRole: true,
  showAuthorCompany: true,
  maxTestimonials: 10,
  columns: 3,
  gap: 24,
  cardStyle: "default",
  animation: "fade",
  autoRotate: false,
  rotateInterval: 5000,
  showNavigation: true,
};

/**
 * Widget entity (database model)
 */
export interface Widget {
  id: string;
  projectId: string;
  config: WidgetConfig;
  createdAt: string;
  updatedAt: string;
}

/**
 * Testimonial entity
 */
export interface Testimonial {
  id: string;
  content: string;
  rating?: number;
  authorName: string;
  authorRole?: string;
  authorCompany?: string;
  authorImage?: string;
  authorEmail?: string;
  videoUrl?: string;
  type?: string;
  createdAt: string;
}

/**
 * Public widget data (returned by API for embedding)
 */
export interface PublicWidgetData {
  widget: {
    id: string;
    name: string;
    type: string;
    layout: WidgetLayout;
    theme: Record<string, any>;
    settings: WidgetConfig;
  };
  project: {
    name: string;
    slug: string;
    logoUrl?: string;
    brandColorPrimary?: string;
    brandColorSecondary?: string;
  };
  testimonials: Testimonial[];
  meta: {
    total: number;
    fetchedAt: string;
  };
}

/**
 * Widget creation payload
 */
export interface CreateWidgetPayload {
  projectId: string;
  config: WidgetConfig;
}

/**
 * Widget update payload
 */
export interface UpdateWidgetPayload {
  config?: Partial<WidgetConfig>;
}
