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
  authorAvatar?: string;  // Changed from authorImage to match database
  authorEmail?: string;
  createdAt: string;
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

export type WidgetType = 'testimonial' | 'review' | 'social-proof';

export type WidgetLayout = 'carousel' | 'grid' | 'masonry' | 'wall' | 'list';

export interface WidgetTheme {
  primaryColor?: string;
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
  theme?: 'light' | 'dark' | 'auto';

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
  cardStyle?: 'default' | 'minimal' | 'bordered';
  animation?: 'fade' | 'slide' | 'none';

  // Carousel Behavior
  autoRotate?: boolean;
  rotateInterval?: number;
}

export interface WidgetConfig {
  widgetId: string;
  apiUrl?: string;
  container?: string | HTMLElement;
  theme?: Partial<WidgetTheme>;
  settings?: Partial<WidgetSettings>;
  onLoad?: (widget: Widget) => void;
  onError?: (error: Error) => void;
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
