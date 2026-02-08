/**
 * PaywallComponents.tsx
 *
 * Reusable components for graceful feature gating across the Tresta application.
 * Implements the "Gentle Paywall" strategy: users can see premium features but
 * interaction is gated with clear, non-intrusive upgrade prompts.
 *
 * @module components/paywall
 */

import * as React from "react";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";
import { useUpgradeModal } from "@/components/billing/upgrade-modal";

// ============================================================================
// TYPES
// ============================================================================

interface BasePaywallProps {
  /** Whether the user has Pro access */
  isPro: boolean;
  /** Feature name for analytics and messaging */
  featureName: string;
  /** Custom tooltip message (overrides default) */
  tooltipMessage?: string;
  /** Plan required for this feature */
  requiredPlan?: "pro" | "business" | "enterprise";
}

// ============================================================================
// PRO BADGE COMPONENT
// ============================================================================

interface ProBadgeProps {
  /** Visual variant */
  variant?: "default" | "subtle" | "inline";
  /** Size of the badge */
  size?: "sm" | "md";
  /** Optional class name overrides */
  className?: string;
  /** Whether to show the crown icon */
  showIcon?: boolean;
}

/**
 * ProBadge - A visual indicator for premium features
 *
 * Usage in dropdowns, cards, and labels to mark premium options.
 *
 * @example
 * // In a dropdown option
 * <SelectItem>
 *   Dark Minimal Theme
 *   <ProBadge size="sm" />
 * </SelectItem>
 *
 * @example
 * // Inline with text
 * <span>Custom Domain <ProBadge variant="inline" /></span>
 */
export function ProBadge({
  variant = "default",
  size = "sm",
  className,
  showIcon = false,
}: ProBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] h-4 px-1.5",
    md: "text-xs h-5 px-2",
  };

  const variantClasses = {
    default:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200 dark:border-amber-800",
    subtle: "bg-muted text-muted-foreground border-border",
    inline:
      "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold uppercase tracking-wider shrink-0",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {showIcon && <Crown className="h-2.5 w-2.5 mr-0.5" />}
      PRO
    </Badge>
  );
}

// ============================================================================
// LOCKED TOGGLE COMPONENT
// ============================================================================

interface LockedToggleProps extends BasePaywallProps {
  /** Current toggle state (only relevant when isPro=true) */
  checked: boolean;
  /** Callback when toggle changes (only called when isPro=true) */
  onCheckedChange: (checked: boolean) => void;
  /** Label for the toggle */
  label: string;
  /** Description text */
  description?: string;
  /** Optional class name for the container */
  className?: string;
}

/**
 * LockedToggle - A toggle switch that's locked for free users
 *
 * Displays a visible but disabled toggle for non-Pro users with clear
 * upgrade messaging. Pro users get full interactivity.
 *
 * States:
 * - Free User: Toggle grayed out (opacity-50), lock icon, PRO badge, hover tooltip
 * - Pro User: Fully interactive toggle, no restrictions
 *
 * @example
 * <LockedToggle
 *   isPro={user.isPro}
 *   featureName="remove_branding"
 *   checked={settings.removeBranding}
 *   onCheckedChange={setRemoveBranding}
 *   label="Remove 'Powered by Tresta' branding"
 *   description="Hide the attribution from your widgets"
 * />
 */
export function LockedToggle({
  isPro,
  featureName,
  tooltipMessage,
  requiredPlan = "pro",
  checked,
  onCheckedChange,
  label,
  description,
  className,
}: LockedToggleProps) {
  const { open: openUpgradeModal } = useUpgradeModal();

  const defaultTooltip = `Upgrade to ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} to unlock this feature`;
  const tooltip = tooltipMessage || defaultTooltip;

  const handleLockedClick = () => {
    toast.info("Premium Feature", {
      description: tooltip,
      action: {
        label: "Upgrade",
        onClick: () => openUpgradeModal(),
      },
    });
  };

  // Pro user - fully interactive
  if (isPro) {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border p-4",
          className,
        )}
      >
        <div className="space-y-0.5">
          <label className="text-sm font-medium leading-none">{label}</label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    );
  }

  // Free user - locked state
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleLockedClick}
            className={cn(
              "flex items-center justify-between rounded-lg border p-4",
              "cursor-pointer transition-all",
              "hover:border-amber-300 dark:hover:border-amber-700",
              "hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
              className,
            )}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <label className="text-sm font-medium leading-none opacity-70 cursor-pointer">
                  {label}
                </label>
                <ProBadge size="sm" />
              </div>
              {description && (
                <p className="text-sm text-muted-foreground opacity-70">
                  {description}
                </p>
              )}
            </div>
            <Switch
              checked={false}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// PREMIUM OPTION WRAPPER
// ============================================================================

interface PremiumOptionProps extends BasePaywallProps {
  /** The option content to render */
  children: React.ReactNode;
  /** Callback when premium option is selected */
  onSelect?: () => void;
  /** Whether this option is currently selected */
  isSelected?: boolean;
  /** Optional class name */
  className?: string;
}

/**
 * PremiumOption - Wrapper for premium options in dropdowns/selectors
 *
 * Follows the "Teaser Dropdown" pattern: premium options ARE selectable
 * but they trigger a warning state rather than blocking.
 *
 * @example
 * // In a theme selector
 * <PremiumOption
 *   isPro={user.isPro}
 *   featureName="dark_minimal_theme"
 *   onSelect={() => setTheme('dark-minimal')}
 *   isSelected={theme === 'dark-minimal'}
 * >
 *   <span>Dark Minimal</span>
 * </PremiumOption>
 */
export function PremiumOption({
  isPro,
  featureName,
  tooltipMessage,
  requiredPlan = "pro",
  children,
  onSelect,
  isSelected,
  className,
}: PremiumOptionProps) {
  const handleSelect = () => {
    onSelect?.();

    // If not pro, show a toast warning (but don't block selection)
    if (!isPro) {
      toast.warning("Premium Feature Selected", {
        description: `This ${featureName.replace(/_/g, " ")} requires ${requiredPlan} to publish.`,
        duration: 5000,
      });
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={cn(
        "flex items-center justify-between w-full",
        !isPro && "cursor-pointer",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-1">{children}</div>
      {!isPro && <ProBadge size="sm" variant="subtle" />}
    </div>
  );
}

// ============================================================================
// PREMIUM FEATURE WARNING BANNER
// ============================================================================

interface PremiumWarningBannerProps {
  /** Whether to show the banner */
  show: boolean;
  /** The feature name being used */
  featureName: string;
  /** Plan required */
  requiredPlan?: "pro" | "business" | "enterprise";
  /** Optional custom message */
  message?: string;
  /** Optional class name */
  className?: string;
}

/**
 * PremiumWarningBanner - Contextual warning for selected premium features
 *
 * Appears when a free user selects a premium option (like a premium theme).
 * Non-blocking - just informative. Hard gate happens at publish time.
 *
 * @example
 * <PremiumWarningBanner
 *   show={!isPro && selectedTheme.isPremium}
 *   featureName="Dark Minimal theme"
 *   requiredPlan="pro"
 * />
 */
export function PremiumWarningBanner({
  show,
  featureName,
  requiredPlan = "pro",
  message,
  className,
}: PremiumWarningBannerProps) {
  const { open: openUpgradeModal } = useUpgradeModal();

  if (!show) return null;

  const defaultMessage = `"${featureName}" requires ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} to publish. Your widget will use the default until you upgrade.`;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        "bg-amber-50 dark:bg-amber-900/20",
        "border-amber-200 dark:border-amber-800",
        "animate-in slide-in-from-top-2 duration-300",
        className,
      )}
    >
      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {message || defaultMessage}
        </p>
      </div>
      <button
        onClick={() => openUpgradeModal()}
        className={cn(
          "text-xs font-semibold px-2 py-1 rounded",
          "bg-amber-600 text-white hover:bg-amber-700",
          "dark:bg-amber-500 dark:hover:bg-amber-600",
          "transition-colors shrink-0",
        )}
      >
        Upgrade
      </button>
    </div>
  );
}

// ============================================================================
// FEATURE GATE HOOK
// ============================================================================

interface UseFeatureGateOptions {
  isPro: boolean;
  onGated?: () => void;
}

/**
 * useFeatureGate - Hook for programmatic feature gating
 *
 * Returns utilities for checking and gating features in component logic.
 *
 * @example
 * const { canUse, showUpgradePrompt } = useFeatureGate({ isPro: user.isPro });
 *
 * const handleSave = () => {
 *   if (!canUse('custom_domain')) {
 *     showUpgradePrompt('Custom Domain');
 *     return;
 *   }
 *   // ... save logic
 * };
 */
export function useFeatureGate({ isPro, onGated }: UseFeatureGateOptions) {
  const { open: openUpgradeModal } = useUpgradeModal();

  const canUse = React.useCallback(
    (feature: string): boolean => {
      // In a real implementation, this would check a feature flags config
      // For now, all "premium" features require Pro
      return isPro;
    },
    [isPro],
  );

  const showUpgradePrompt = React.useCallback(
    (featureName: string, plan: "pro" | "business" | "enterprise" = "pro") => {
      onGated?.();
      toast.info(`Upgrade Required`, {
        description: `${featureName} requires ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`,
        action: {
          label: "Upgrade Now",
          onClick: () => openUpgradeModal(),
        },
      });
    },
    [onGated, openUpgradeModal],
  );

  return {
    canUse,
    showUpgradePrompt,
    isPro,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  ProBadgeProps,
  LockedToggleProps,
  PremiumOptionProps,
  PremiumWarningBannerProps,
  UseFeatureGateOptions,
};
