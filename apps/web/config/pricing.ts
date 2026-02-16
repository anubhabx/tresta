/**
 * Static Pricing Configuration
 *
 * Single source of truth for all pricing data.
 * Eliminates DB latency on landing page and makes copy tweaks instant.
 *
 * NOTE: Replace PLACEHOLDER_* IDs with actual Razorpay Plan IDs before production.
 */

export interface PlanQuota {
  testimonials: number; // -1 = unlimited
  video_minutes: number; // -1 = unlimited
  projects: number; // -1 = unlimited
  widgets: number; // -1 = unlimited
}

export interface PlanCTA {
  public: string; // CTA text for unauthenticated users
  dashboard: string; // CTA text for authenticated users
}

export interface PlanConfig {
  id: string; // Razorpay Plan ID (safe to expose)
  name: string;
  description: string;
  price: number; // In smallest currency unit (paise for INR)
  currency: "INR" | "USD";
  interval: "month" | "year";
  features: string[];
  quota: PlanQuota;
  cta: PlanCTA;
  popular?: boolean;
  badge?: string; // e.g., "Best Value", "Most Popular"
}

export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out Tresta",
    price: 0,
    currency: "INR",
    interval: "month",
    features: [
      "1 Project",
      "10 Testimonials",
      "1 Widget",
      "API access (GET testimonials, rate-limited)",
      "Basic embed customization",
      "Email support",
    ],
    quota: {
      testimonials: 10,
      video_minutes: 0,
      projects: 1,
      widgets: 1,
    },
    cta: {
      public: "Start Free",
      dashboard: "Current Plan",
    },
  },
  {
    id: process.env.NODE_ENV === "development" ? "plan_SCXjlaJDT9zLG7" : "plan_SCXi6nlx9nSX66",
    name: "Pro",
    description: "For growing businesses",
    price: 30000, // ₹300 in paise
    currency: "INR",
    interval: "month",
    features: [
      "Unlimited Projects",
      "Unlimited Testimonials",
      "Unlimited Widgets",
      "Video testimonials (up to 5 min each)",
      "Custom branding & colors",
      "API access (GET testimonials, rate-limited)",
      "Priority support",
    ],
    quota: {
      testimonials: -1,
      video_minutes: 5,
      projects: -1,
      widgets: -1,
    },
    cta: {
      public: "Upgrade to Pro",
      dashboard: "Upgrade",
    },
    popular: true,
    badge: "Most Popular",
  },
  {
    id: process.env.NODE_ENV === "development" ? "plan_SCXkFO2OOuIFP0" : "plan_SCXhtkjzmSeYJp",
    name: "Pro Yearly",
    description: "Best value for committed teams",
    price: 300000, // ₹3,000 in paise (2 months free)
    currency: "INR",
    interval: "year",
    features: [
      "Everything in Pro Monthly",
      "2 months free (save ₹1,000/year)",
      "Early access to new features",
      "Dedicated onboarding call",
    ],
    quota: {
      testimonials: -1,
      video_minutes: 5,
      projects: -1,
      widgets: -1,
    },
    cta: {
      public: "Get Pro Yearly",
      dashboard: "Switch to Yearly",
    },
    badge: "Best Value",
  },
];

/**
 * Helper to get a plan by ID
 */
export function getPlanById(id: string): PlanConfig | undefined {
  return PLANS.find((plan) => plan.id === id);
}

/**
 * Helper to format price for display
 */
export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price / 100);
}

/**
 * Get the Free plan config
 */
export const FREE_PLAN = PLANS.find((p) => p.id === "free")!;

/**
 * Get all paid plans
 */
export const PAID_PLANS = PLANS.filter((p) => p.price > 0);
