/**
 * Tresta Widget Types
 * Type definitions for the embeddable testimonial widget
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

export interface WidgetSettings {
  showRating?: boolean;
  showDate?: boolean;
  showAuthorImage?: boolean;
  showAuthorRole?: boolean;
  showAuthorCompany?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  itemsPerPage?: number;
  columns?: number;
  maxItems?: number;
  animation?: 'fade' | 'slide' | 'none';
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
