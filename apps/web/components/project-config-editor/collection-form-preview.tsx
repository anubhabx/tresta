"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { FormConfig } from "@/types/api";
import { CollectionFormBody } from "@/components/collection-form";

type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_VIEWPORT_WIDTH: Record<PreviewDevice, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 375,
};

const DEVICE_FRAME_WIDTH: Record<PreviewDevice, number> = {
  desktop: 1264,
  tablet: 824,
  mobile: 425,
};

const DEVICE_FRAME_HEIGHT: Record<PreviewDevice, number> = {
  desktop: 860,
  tablet: 980,
  mobile: 900,
};

const getSlugFromProjectName = (name: string) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "your-project";
};

export interface CollectionFormPreviewProps {
  formConfig?: FormConfig | null;
  projectName?: string;
  projectTagline?: string | null;
  projectDescription?: string | null;
  logoUrl?: string | null;
  brandColorPrimary?: string | null;
  className?: string;
}

export function CollectionFormPreview({
  formConfig,
  projectName = "Your Project",
  projectTagline,
  projectDescription,
  logoUrl,
  brandColorPrimary,
  className,
}: CollectionFormPreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(
    undefined,
  );

  const frameWidth = DEVICE_FRAME_WIDTH[device];
  const frameHeight = DEVICE_FRAME_HEIGHT[device];
  const projectSlug = useMemo(
    () => getSlugFromProjectName(projectName),
    [projectName],
  );

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      const newScale = Math.min(1, containerWidth / frameWidth);
      const naturalHeight = inner.offsetHeight;
      setScale(newScale);
      setScaledHeight(naturalHeight * newScale);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [frameHeight, frameWidth]);

  const previewForm = (
    <CollectionFormBody
      mode="preview"
      previewViewport={device}
      formConfig={formConfig}
      projectName={projectName}
      projectTagline={projectTagline}
      projectDescription={projectDescription}
      logoUrl={logoUrl}
      brandColorPrimary={brandColorPrimary}
    />
  );

  const framedPreview =
    device === "desktop" ? (
      <div
        style={{
          width: DEVICE_FRAME_WIDTH.desktop,
          height: DEVICE_FRAME_HEIGHT.desktop,
        }}
        className="overflow-hidden rounded-lg border border-border/70 bg-background/95 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.55)] transition-all duration-300 ease-out"
      >
        <div className="flex h-11 items-center gap-3 border-b border-border/70 bg-muted/35 px-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/85" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/85" />
          </div>
          <div className="flex h-7 flex-1 items-center justify-center rounded-md border border-border/70 bg-background px-3 text-[11px] text-muted-foreground">
            yourapp.com/collect/{projectSlug}
          </div>
        </div>
        <div
          className="overflow-y-auto"
          style={{ height: DEVICE_FRAME_HEIGHT.desktop - 44 }}
        >
          <div
            className="min-h-full px-8 py-8"
            style={{
              background:
                "radial-gradient(120% 120% at 50% -10%, rgba(59,130,246,0.12) 0%, rgba(15,23,42,0) 45%), hsl(var(--muted) / 0.22)",
            }}
          >
            <div
              className="mx-auto"
              style={{ width: DEVICE_VIEWPORT_WIDTH.desktop, maxWidth: "100%" }}
            >
              {previewForm}
            </div>
          </div>
        </div>
      </div>
    ) : device === "tablet" ? (
      <div
        style={{
          width: DEVICE_FRAME_WIDTH.tablet,
          height: DEVICE_FRAME_HEIGHT.tablet,
        }}
        className="mx-auto rounded-[34px] border border-border/70 bg-zinc-900 p-3 shadow-[0_26px_70px_-45px_rgba(15,23,42,0.65)] transition-all duration-300 ease-out"
      >
        <div
          className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10"
          style={{
            background:
              "radial-gradient(120% 120% at 50% -10%, rgba(59,130,246,0.16) 0%, rgba(15,23,42,0) 48%), rgb(12, 14, 19)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,transparent_36%)] opacity-40" />
          <div
            className="relative h-full overflow-y-auto px-5 py-6"
          >
            <div
              className="relative mx-auto"
              style={{ width: DEVICE_VIEWPORT_WIDTH.tablet, maxWidth: "100%" }}
            >
              {previewForm}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-3 h-1.5 w-20 rounded-full bg-white/20" />
      </div>
    ) : (
      <div
        style={{
          width: DEVICE_FRAME_WIDTH.mobile,
          height: DEVICE_FRAME_HEIGHT.mobile,
        }}
        className="mx-auto rounded-[42px] border border-border/70 bg-zinc-900 p-[10px] shadow-[0_28px_65px_-48px_rgba(15,23,42,0.7)] transition-all duration-300 ease-out"
      >
        <div
          className="relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10"
          style={{
            background:
              "radial-gradient(120% 120% at 50% -10%, rgba(59,130,246,0.2) 0%, rgba(15,23,42,0) 52%), rgb(10, 12, 16)",
          }}
        >
          <div className="mx-auto mb-3 mt-2 h-6 w-28 rounded-full bg-black/65" />
          <div
            className="relative flex-1 overflow-y-auto px-3 pb-5"
          >
            <div
              className="mx-auto"
              style={{ width: DEVICE_VIEWPORT_WIDTH.mobile, maxWidth: "100%" }}
            >
              {previewForm}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          <span>Live Preview</span>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background/70 p-1 shadow-sm">
          {(
            [
              { value: "desktop", icon: Monitor, label: "Desktop" },
              { value: "tablet", icon: Tablet, label: "Tablet" },
              { value: "mobile", icon: Smartphone, label: "Mobile" },
            ] as const
          ).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDevice(value)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all duration-200",
                device === value
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`Preview ${label.toLowerCase()} frame`}
              title={`${label} preview`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        style={{ height: scaledHeight ?? "auto" }}
        className="w-full overflow-hidden transition-[height] duration-300 ease-out"
      >
        <div className="flex justify-center">
          <div
            ref={innerRef}
            style={{
              width: frameWidth,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              pointerEvents: "auto",
              userSelect: "none",
            }}
            className="transition-transform duration-300 ease-out"
            aria-hidden="true"
          >
            {framedPreview}
          </div>
        </div>
      </div>
    </div>
  );
}
