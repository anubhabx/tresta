/**
 * Shared Widget Types
 * Used across API, Web App, and Widget packages
 */
/**
 * Widget layout types
 */
export type WidgetLayout = "carousel" | "grid" | "masonry" | "wall" | "list";
/**
 * Subset of layouts we expose in the MVP embed builder.
 */
export declare const MVP_WIDGET_LAYOUTS: readonly ["grid", "carousel"];
export type MvpWidgetLayout = (typeof MVP_WIDGET_LAYOUTS)[number];
/**
 * Widget theme types
 */
export type WidgetTheme = "light" | "dark" | "auto";
export declare const MVP_WIDGET_THEMES: readonly ["light", "dark", "auto"];
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
    layout?: WidgetLayout;
    theme?: WidgetTheme;
    primaryColor?: string;
    secondaryColor?: string;
    showRating?: boolean;
    showDate?: boolean;
    showAvatar?: boolean;
    showAuthorRole?: boolean;
    showAuthorCompany?: boolean;
    maxTestimonials?: number;
    columns?: number;
    gap?: number;
    cardStyle?: CardStyle;
    animation?: AnimationType;
    autoRotate?: boolean;
    rotateInterval?: number;
    showNavigation?: boolean;
}
/**
 * Default widget configuration values
 */
export declare const DEFAULT_WIDGET_CONFIG: Required<WidgetConfig>;
/**
 * Fields surfaced in the MVP-level customization UI.
 */
export declare const MVP_WIDGET_CONFIG_FIELDS: readonly ["layout", "theme", "primaryColor", "showRating", "showAvatar", "maxTestimonials", "autoRotate", "rotateInterval"];
export type MvpWidgetConfigField = (typeof MVP_WIDGET_CONFIG_FIELDS)[number];
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
//# sourceMappingURL=widget.d.ts.map