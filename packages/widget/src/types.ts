/**
 * Tresta Widget Types
 * Type definitions for the embeddable testimonial widget
 *
 * Note: These types are synced with @workspace/types
 */

export interface Testimonial {
  id: string;
  content: string;
  rating?: number;
  authorName: string;
  authorRole?: string;
  authorCompany?: string;
  authorAvatar?: string; // Changed from authorImage to match database
  authorEmail?: string;
  createdAt: string;
  isOAuthVerified?: boolean;
  oauthProvider?: string | null;
}

export interface Widget {
  id: string;
  name: string;
  type: WidgetType;
  layout: WidgetLayout;
  theme: WidgetTheme;
  settings: WidgetSettings;
  testimonials: Testimonial[];
}

export type WidgetType = "testimonial" | "review" | "social-proof";

export type WidgetLayout = "carousel" | "grid" | "masonry" | "wall" | "list";

/**
 * Widget Theme Configuration
 *
 * Properties we store and customize:
 * - primaryColor: Main brand color (stored in DB)
 * - secondaryColor: Secondary brand color (stored in DB)
 *
 * Properties with defaults (for future expansion):
 * - backgroundColor: Widget background (default: transparent)
 * - textColor: Text color (default: theme-based)
 * - cardBackgroundColor: Card background (default: theme-based)
 * - borderRadius: Corner radius (default: 12px)
 * - fontFamily: Font stack (default: system fonts)
 * - starColor: Rating star color (default: gold)
 */
export interface WidgetTheme {
  primaryColor?: string;
  secondaryColor?: string;
  // Future expansion properties - use defaults from styles.ts
  backgroundColor?: string;
  textColor?: string;
  cardBackgroundColor?: string;
  borderRadius?: number;
  fontFamily?: string;
  starColor?: string;
}

/**
 * Widget Settings (synced with WidgetConfig from @workspace/types)
 */
export interface WidgetSettings {
  // Layout & Theme
  layout?: WidgetLayout;
  theme?: "light" | "dark" | "auto";

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
  cardStyle?: "default" | "minimal" | "bordered";
  animation?: "fade" | "slide" | "none";

  // Carousel Behavior
  autoRotate?: boolean;
  rotateInterval?: number;
  showNavigation?: boolean; // Show/hide carousel navigation buttons
}

export interface WidgetConfig {
  widgetId: string;
  apiUrl?: string;
  apiKey?: string; // API key for authentication
  container?: string | HTMLElement;
  theme?: Partial<WidgetTheme>;
  settings?: Partial<WidgetSettings>;
  onLoad?: (widget: Widget) => void;
  onError?: (error: Error) => void;
  // For preview/demo mode - skip API call and use provided data
  mockData?: WidgetData;
  // Auto-adapt theme to host page colors
  adaptToHost?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface WidgetData {
  widget: Widget;
  testimonials: Testimonial[];
}
