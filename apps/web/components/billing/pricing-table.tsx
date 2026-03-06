"use client";

import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { PLANS, formatPrice, type PlanConfig } from "@/config/pricing";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Check,
  Shield,
  Video,
  Palette,
  Code,
  HeadphonesIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import { CheckoutButton } from "./checkout-button";
import { useSubscription } from "@/hooks/use-subscription";

const featureIcons: Record<string, React.ReactNode> = {
  Unlimited: <Check className="h-3.5 w-3.5" />,
  Video: <Video className="h-3.5 w-3.5" />,
  Custom: <Palette className="h-3.5 w-3.5" />,
  API: <Code className="h-3.5 w-3.5" />,
  Priority: <HeadphonesIcon className="h-3.5 w-3.5" />,
  Early: <Shield className="h-3.5 w-3.5" />,
};

function getFeatureIcon(feature: string): React.ReactNode {
  for (const [key, icon] of Object.entries(featureIcons)) {
    if (feature.includes(key)) return icon;
  }
  return <Check className="h-3.5 w-3.5" />;
}

interface PricingCardProps {
  plan: PlanConfig;
  isAuthenticated: boolean;
  currentPlanId?: string | null;
  onUnauthenticatedClick: (planId: string) => void;
  autoTriggerCheckout?: boolean;
  compact?: boolean;
  keyFeatureCount?: number;
}

function PricingCard({
  plan,
  isAuthenticated,
  currentPlanId,
  onUnauthenticatedClick,
  autoTriggerCheckout,
  compact = false,
  keyFeatureCount = 4,
}: PricingCardProps) {
  const isPopular = plan.popular;
  const isFree = plan.price === 0;
  const isCurrentPlan = currentPlanId === plan.id || (isFree && !currentPlanId);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);
  const visibleFeatures = compact
    ? plan.features.slice(0, keyFeatureCount)
    : plan.features;
  const hiddenFeaturesCount = Math.max(
    plan.features.length - visibleFeatures.length,
    0,
  );

  useEffect(() => {
    if (autoTriggerCheckout && isAuthenticated && !isFree && !isCurrentPlan) {
      const timer = setTimeout(() => {
        checkoutButtonRef.current?.click();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoTriggerCheckout, isAuthenticated, isFree, isCurrentPlan]);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border transition-all duration-300",
        isPopular
          ? "border-primary/60 bg-primary/[0.04]"
          : "border-white/10  hover:border-white/20",
        compact && "gap-0",
      )}
    >
      {/* Popular top accent line */}
      {isPopular && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-t-lg" />
      )}

      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge
            className={cn(
              "px-3 py-1 text-xs font-medium",
              isPopular
                ? "bg-primary text-white border-0"
                : "bg-zinc-800 text-zinc-300 border border-zinc-700",
            )}
          >
            {plan.badge}
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className={cn("text-center p-6 pb-4", compact && "p-4 pb-3")}>
        <h3
          className={cn(
            "font-semibold text-white mb-1",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {plan.name}
        </h3>
        <p className="text-sm text-zinc-500">{plan.description}</p>
      </div>

      {/* Price */}
      <div className={cn("text-center px-6 pb-6", compact && "px-4 pb-4")}>
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={cn(
              "font-bold tracking-tight text-white",
              compact ? "text-3xl" : "text-5xl",
            )}
          >
            {isFree ? "Free" : formatPrice(plan.price, plan.currency)}
          </span>
          {!isFree && (
            <span className="text-zinc-500 text-sm">/{plan.interval}</span>
          )}
        </div>
        {plan.interval === "year" && plan.price > 0 && (
          <p className="text-xs text-zinc-500 mt-1.5">
            {formatPrice(Math.round(plan.price / 12), plan.currency)}/month,
            billed annually
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 h-px " />

      {/* Features */}
      <div className={cn("flex-1 p-6", compact && "p-4")}>
        <ul className="space-y-3">
          {visibleFeatures.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm">
              <span
                className={cn(
                  "mt-0.5 shrink-0",
                  isPopular ? "text-primary" : "text-zinc-400",
                )}
              >
                {getFeatureIcon(feature)}
              </span>
              <span className="text-zinc-300">{feature}</span>
            </li>
          ))}
        </ul>

        {compact && hiddenFeaturesCount > 0 && (
          <p className="text-xs text-zinc-600 mt-3">
            +{hiddenFeaturesCount} more feature
            {hiddenFeaturesCount > 1 ? "s" : ""}
          </p>
        )}

        {/* Quota Details */}
        {!compact && (
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3 font-medium">
              Limits
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                {
                  value: plan.quota.projects,
                  label: "Projects",
                },
                {
                  value: plan.quota.testimonials,
                  label: "Testimonials",
                },
                {
                  value: plan.quota.widgets,
                  label: "Widgets",
                },
                {
                  value: plan.quota.video_minutes,
                  label: "Video",
                  format: (v: number) =>
                    v === 0 ? "—" : v === -1 ? "∞" : `${v}min`,
                },
              ].map(({ value, label, format }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-white">
                    {format ? format(value) : value === -1 ? "∞" : value}
                  </span>
                  <span className="text-zinc-500 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className={cn("p-6 pt-0", compact && "p-4 pt-0")}>
        {isAuthenticated ? (
          isFree ? (
            <Button
              className="w-full rounded-md"
              variant="outline"
              disabled={isCurrentPlan}
            >
              {isCurrentPlan ? "Current Plan" : "Downgrade"}
            </Button>
          ) : isCurrentPlan ? (
            <Button
              className="w-full rounded-md"
              variant={isPopular ? "default" : "outline"}
              disabled
            >
              Current Plan
            </Button>
          ) : (
            <CheckoutButton
              planId={plan.id}
              planName={plan.name}
              price={plan.price}
              ref={checkoutButtonRef}
            />
          )
        ) : (
          <Button
            className="w-full rounded-md"
            variant={isPopular ? "default" : "outline"}
            size="lg"
            onClick={() => onUnauthenticatedClick(plan.id)}
          >
            {plan.cta.public}
          </Button>
        )}
      </div>
    </div>
  );
}

export function PricingTable() {
  return <PricingTableView />;
}

interface PricingTableViewProps {
  compact?: boolean;
  keyFeatureCount?: number;
}

export function PricingTableView({
  compact = false,
  keyFeatureCount = 4,
}: PricingTableViewProps = {}) {
  const { isSignedIn } = useUser();
  const { plan: currentPlan } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutPlanId = searchParams.get("checkout");

  const handleUnauthenticatedClick = (planId: string) => {
    if (planId === "free") {
      router.push("/sign-up");
      return;
    }
    router.push(
      `/sign-in?redirect_url=${encodeURIComponent(`/pricing?checkout=${planId}`)}`,
    );
  };

  return (
    <div
      className={cn(
        "grid max-w-6xl mx-auto",
        compact
          ? "grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5"
          : "grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch",
      )}
    >
      {PLANS.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isAuthenticated={!!isSignedIn}
          currentPlanId={currentPlan?.id}
          onUnauthenticatedClick={handleUnauthenticatedClick}
          autoTriggerCheckout={checkoutPlanId === plan.id}
          compact={compact}
          keyFeatureCount={keyFeatureCount}
        />
      ))}
    </div>
  );
}
