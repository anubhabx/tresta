"use client";

import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { PLANS, formatPrice, type PlanConfig } from "@/config/pricing";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Check,
  Zap,
  Shield,
  BarChart3,
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
  Unlimited: <Zap className="h-4 w-4" />,
  Video: <Video className="h-4 w-4" />,
  Custom: <Palette className="h-4 w-4" />,
  API: <Code className="h-4 w-4" />,
  Priority: <HeadphonesIcon className="h-4 w-4" />,
  Analytics: <BarChart3 className="h-4 w-4" />,
  Early: <Shield className="h-4 w-4" />,
};

function getFeatureIcon(feature: string): React.ReactNode {
  for (const [key, icon] of Object.entries(featureIcons)) {
    if (feature.includes(key)) return icon;
  }
  return <Check className="h-4 w-4" />;
}

interface PricingCardProps {
  plan: PlanConfig;
  isAuthenticated: boolean;
  currentPlanId?: string | null;
  onUnauthenticatedClick: (planId: string) => void;
  autoTriggerCheckout?: boolean;
}

function PricingCard({
  plan,
  isAuthenticated,
  currentPlanId,
  onUnauthenticatedClick,
  autoTriggerCheckout,
}: PricingCardProps) {
  const isPopular = plan.popular;
  const isFree = plan.price === 0;
  const isCurrentPlan = currentPlanId === plan.id || (isFree && !currentPlanId);
  const checkoutButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-trigger checkout if returning from sign-in with checkout param
  useEffect(() => {
    if (autoTriggerCheckout && isAuthenticated && !isFree && !isCurrentPlan) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        checkoutButtonRef.current?.click();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoTriggerCheckout, isAuthenticated, isFree, isCurrentPlan]);

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-200 hover:shadow-lg",
        isPopular && "border-primary shadow-md scale-[1.02]",
      )}
    >
      {plan.badge && (
        <Badge
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1"
          variant={isPopular ? "default" : "secondary"}
        >
          {plan.badge}
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-sm">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Price */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {isFree ? "Free" : formatPrice(plan.price, plan.currency)}
            </span>
            {!isFree && (
              <span className="text-muted-foreground">/{plan.interval}</span>
            )}
          </div>
          {plan.interval === "year" && plan.price > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {formatPrice(Math.round(plan.price / 12), plan.currency)}/month
              billed annually
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 text-primary shrink-0">
                {getFeatureIcon(feature)}
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Quota Details */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Limits
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">
                {plan.quota.projects === -1 ? "∞" : plan.quota.projects}
              </span>{" "}
              <span className="text-muted-foreground">Projects</span>
            </div>
            <div>
              <span className="font-medium">
                {plan.quota.testimonials === -1 ? "∞" : plan.quota.testimonials}
              </span>{" "}
              <span className="text-muted-foreground">Testimonials</span>
            </div>
            <div>
              <span className="font-medium">
                {plan.quota.widgets === -1 ? "∞" : plan.quota.widgets}
              </span>{" "}
              <span className="text-muted-foreground">Widgets</span>
            </div>
            <div>
              <span className="font-medium">
                {plan.quota.video_minutes === -1
                  ? "∞"
                  : plan.quota.video_minutes === 0
                    ? "—"
                    : `${plan.quota.video_minutes}min`}
              </span>{" "}
              <span className="text-muted-foreground">Video</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {isAuthenticated ? (
          isFree ? (
            <Button
              className="w-full"
              variant="outline"
              disabled={isCurrentPlan}
            >
              {isCurrentPlan ? "Current Plan" : "Downgrade"}
            </Button>
          ) : isCurrentPlan ? (
            <Button
              className="w-full"
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
            className="w-full"
            variant={isPopular ? "default" : "outline"}
            size="lg"
            onClick={() => onUnauthenticatedClick(plan.id)}
          >
            {plan.cta.public}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function PricingTable() {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
      {PLANS.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isAuthenticated={!!isSignedIn}
          currentPlanId={currentPlan?.id}
          onUnauthenticatedClick={handleUnauthenticatedClick}
          autoTriggerCheckout={checkoutPlanId === plan.id}
        />
      ))}
    </div>
  );
}
