/**
 * Shared Widget Types
 * Used across API, Web App, and Widget packages
 */
/**
 * Subset of layouts we expose in the MVP embed builder.
 */
export const MVP_WIDGET_LAYOUTS = ["grid", "carousel"];
export const MVP_WIDGET_THEMES = ["light", "dark", "auto"];
/**
 * Default widget configuration values
 */
export const DEFAULT_WIDGET_CONFIG = {
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
 * Fields surfaced in the MVP-level customization UI.
 */
export const MVP_WIDGET_CONFIG_FIELDS = [
    "layout",
    "theme",
    "primaryColor",
    "showRating",
    "showAvatar",
    "maxTestimonials",
    "autoRotate",
    "rotateInterval",
];
