/**
 * Core type definitions for the Tresta Widget System
 */

export interface WidgetConfig {
  widgetId: string;
  apiKey: string;
  container?: string | HTMLElement;
  debug?: boolean;
  telemetry?: boolean;
  version?: string;
  theme?: ThemeConfig;
  errorMessage?: string;
  emptyMessage?: string;
  apiUrl?: string;
}

export interface WidgetInstance {
  mount(container: HTMLElement): Promise<void>;
  unmount(): void;
  refresh(): Promise<void>;
  getState(): WidgetState;
}

export interface WidgetState {
  mounted: boolean;
  loading: boolean;
  error: Error | null;
  data: WidgetData | null;
}

export interface WidgetData {
  widgetId: string;
  config: WidgetDisplayConfig;
  testimonials: Testimonial[];
}

export interface WidgetDisplayConfig {
  layout: LayoutConfig;
  theme: ThemeConfig;
  display: DisplayOptions;
}

export interface LayoutConfig {
  type: 'carousel' | 'grid' | 'masonry' | 'wall' | 'list';
  maxTestimonials?: number;
  autoRotate?: boolean;
  rotateInterval?: number;
  showNavigation?: boolean;
  columns?: number;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  cardStyle: 'default' | 'minimal' | 'bordered';
}

export interface DisplayOptions {
  showRating: boolean;
  showDate: boolean;
  showAvatar: boolean;
  showAuthorRole: boolean;
  showAuthorCompany: boolean;
  maxTestimonials?: number;
}

export interface Testimonial {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  isPublished: boolean;
  isApproved: boolean;
  isOAuthVerified: boolean;
  oauthProvider?: string;
  author: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
    company?: string;
  };
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
}

export enum WidgetErrorCode {
  INVALID_WIDGET_ID = 'INVALID_WIDGET_ID',
  API_TIMEOUT = 'API_TIMEOUT',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  PARSE_ERROR = 'PARSE_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
}

export class WidgetError extends Error {
  constructor(
    public code: WidgetErrorCode,
    message: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'WidgetError';
  }
}
