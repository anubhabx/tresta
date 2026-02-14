/**
 * Color Picker
 *
 * A compact, popover-based color picker built with the app's design system.
 * Uses Popover for the dropdown, Radix Slider for the hue track, and DS Input
 * for hex editing. No external color libraries — all conversion math is inlined.
 *
 * @module components/color-picker
 */

"use client";

import * as React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PipetteIcon } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";

// ============================================================================
// COLOR CONVERSION UTILITIES (no external deps)
// ============================================================================

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** HSL (h: 0-360, s: 0-100, l: 0-100) → RGB (0-255 each) */
function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/** RGB (0-255 each) → HSL (h: 0-360, s: 0-100, l: 0-100) */
function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return [0, 0, Math.round(l * 100)];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

/** Hex string → RGB tuple */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** RGB → 6-digit hex (uppercase) */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

/** Hex → HSL */
function hexToHsl(hex: string): [number, number, number] {
  return rgbToHsl(...hexToRgb(hex));
}

/** HSL → Hex */
function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(...hslToRgb(h, s, l));
}

/** Validate a 3 or 6 char hex string */
function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

// ============================================================================
// COLOR PICKER COMPONENT
// ============================================================================

export interface ColorPickerProps {
  /** Current hex color value (controlled) */
  value?: string;
  /** Default hex color (uncontrolled fallback) */
  defaultValue?: string;
  /** Called with a 6-digit uppercase hex string on change */
  onChange?: (hex: string) => void;
  /** Disable all interaction */
  disabled?: boolean;
  /** Additional class name for the trigger */
  className?: string;
  /** Placeholder text for the hex input */
  placeholder?: string;
}

export function ColorPicker({
  value,
  defaultValue = "#3B82F6",
  onChange,
  disabled = false,
  className,
  placeholder = "#000000",
}: ColorPickerProps) {
  // Derive initial HSL from value or default
  const initialHex = value || defaultValue;
  const [initH, initS, initL] = hexToHsl(
    isValidHex(initialHex) ? initialHex : "#000000",
  );

  const [hue, setHue] = useState(initH);
  const [saturation, setSaturation] = useState(initS);
  const [lightness, setLightness] = useState(initL);
  const [hexInput, setHexInput] = useState(
    isValidHex(initialHex) ? initialHex.toUpperCase() : "#000000",
  );

  // Track whether we're being externally controlled to avoid loops
  const isExternalUpdate = useRef(false);

  // Sync from external value prop
  useEffect(() => {
    if (value && isValidHex(value)) {
      const [h, s, l] = hexToHsl(value);
      const currentHex = hslToHex(hue, saturation, lightness);
      // Only update if the external value is actually different
      if (currentHex.toUpperCase() !== value.toUpperCase()) {
        isExternalUpdate.current = true;
        setHue(h);
        setSaturation(s);
        setLightness(l);
        setHexInput(value.toUpperCase());
      }
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent when internal state changes (not from external sync)
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }
    const hex = hslToHex(hue, saturation, lightness);
    setHexInput(hex);
    onChange?.(hex);
  }, [hue, saturation, lightness]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle hex text input
  const handleHexInput = useCallback(
    (raw: string) => {
      // Always update the text field so the user can type freely
      const val = raw.startsWith("#") ? raw : `#${raw}`;
      setHexInput(val);
      if (isValidHex(val)) {
        const [h, s, l] = hexToHsl(val);
        isExternalUpdate.current = true; // prevent double-fire
        setHue(h);
        setSaturation(s);
        setLightness(l);
        onChange?.(val.toUpperCase());
      }
    },
    [onChange],
  );

  // EyeDropper
  const handleEyeDropper = useCallback(async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const dropper = new EyeDropper();
      const result = await dropper.open();
      handleHexInput(result.sRGBHex);
    } catch {
      // User cancelled or API not available
    }
  }, [handleHexInput]);

  const currentHex = hslToHex(hue, saturation, lightness);
  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-all duration-150",
            "hover:border-ring hover:bg-accent/50",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
            className,
          )}
        >
          <span
            className="h-5 w-5 shrink-0 rounded border border-border"
            style={{ backgroundColor: currentHex }}
          />
          <span className="font-mono text-xs text-muted-foreground">
            {currentHex}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-3 space-y-3"
        align="start"
        sideOffset={6}
      >
        {/* Saturation / Lightness canvas */}
        <SaturationPanel
          hue={hue}
          saturation={saturation}
          lightness={lightness}
          onSaturationChange={setSaturation}
          onLightnessChange={setLightness}
        />

        {/* Hue slider */}
        <HueSlider hue={hue} onHueChange={setHue} />

        {/* Hex input + eyedropper */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Input
              className="h-8 font-mono text-xs pl-3 pr-2 uppercase"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder={placeholder}
              maxLength={7}
            />
          </div>
          {hasEyeDropper && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleEyeDropper}
            >
              <PipetteIcon className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// SATURATION / LIGHTNESS PANEL
// ============================================================================

interface SaturationPanelProps {
  hue: number;
  saturation: number;
  lightness: number;
  onSaturationChange: (s: number) => void;
  onLightnessChange: (l: number) => void;
}

function SaturationPanel({
  hue,
  saturation,
  lightness,
  onSaturationChange,
  onLightnessChange,
}: SaturationPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Convert HSL to canvas position
  const positionX = useMemo(() => {
    if (saturation === 0 && lightness === 0) return 0;
    if (saturation === 0 && lightness === 100) return 0;
    return clamp(saturation / 100, 0, 1);
  }, [saturation, lightness]);

  const positionY = useMemo(() => {
    const topLightness = saturation < 1 ? 100 : 50 + 50 * (1 - saturation / 100);
    const y = topLightness === 0 ? 1 : 1 - lightness / topLightness;
    return clamp(y, 0, 1);
  }, [saturation, lightness]);

  const updateFromPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((clientY - rect.top) / rect.height, 0, 1);

      const newSaturation = x * 100;
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x);
      const newLightness = topLightness * (1 - y);

      onSaturationChange(newSaturation);
      onLightnessChange(newLightness);
    },
    [onSaturationChange, onLightnessChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateFromPosition(e.clientX, e.clientY);
    },
    [updateFromPosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updateFromPosition(e.clientX, e.clientY);
    },
    [updateFromPosition],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const bgGradient = useMemo(
    () =>
      `linear-gradient(0deg, #000, transparent), linear-gradient(90deg, #fff, transparent), hsl(${hue}, 100%, 50%)`,
    [hue],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-32 w-full cursor-crosshair rounded-md border border-border overflow-hidden"
      style={{ background: bgGradient }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
        style={{
          left: `${positionX * 100}%`,
          top: `${positionY * 100}%`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
}

// ============================================================================
// HUE SLIDER
// ============================================================================

interface HueSliderProps {
  hue: number;
  onHueChange: (hue: number) => void;
}

function HueSlider({ hue, onHueChange }: HueSliderProps) {
  return (
    <SliderPrimitive.Root
      className="relative flex h-4 w-full touch-none items-center select-none"
      min={0}
      max={360}
      step={1}
      value={[hue]}
      onValueChange={([h]) => onHueChange(h!)}
    >
      <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <SliderPrimitive.Range className="absolute h-full bg-transparent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden" />
    </SliderPrimitive.Root>
  );
}

// ============================================================================
// INLINE COLOR PICKER (non-popover variant for embedding)
// ============================================================================

export interface InlineColorPickerProps {
  /** Current hex color value */
  value?: string;
  /** Default hex color */
  defaultValue?: string;
  /** Called with a 6-digit uppercase hex string on change */
  onChange?: (hex: string) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * An inline (non-popover) version of the color picker.
 * Renders the saturation panel, hue slider, and hex input directly.
 * Used when the picker should always be visible (e.g., in form fields).
 */
export function InlineColorPicker({
  value,
  defaultValue = "#3B82F6",
  onChange,
  disabled = false,
  className,
}: InlineColorPickerProps) {
  const initialHex = value || defaultValue;
  const [initH, initS, initL] = hexToHsl(
    isValidHex(initialHex) ? initialHex : "#000000",
  );

  const [hue, setHue] = useState(initH);
  const [saturation, setSaturation] = useState(initS);
  const [lightness, setLightness] = useState(initL);
  const [hexInput, setHexInput] = useState(
    isValidHex(initialHex) ? initialHex.toUpperCase() : "#000000",
  );

  const isExternalUpdate = useRef(false);

  useEffect(() => {
    if (value && isValidHex(value)) {
      const [h, s, l] = hexToHsl(value);
      const currentHex = hslToHex(hue, saturation, lightness);
      if (currentHex.toUpperCase() !== value.toUpperCase()) {
        isExternalUpdate.current = true;
        setHue(h);
        setSaturation(s);
        setLightness(l);
        setHexInput(value.toUpperCase());
      }
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }
    const hex = hslToHex(hue, saturation, lightness);
    setHexInput(hex);
    onChange?.(hex);
  }, [hue, saturation, lightness]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHexInput = useCallback(
    (raw: string) => {
      const val = raw.startsWith("#") ? raw : `#${raw}`;
      setHexInput(val);
      if (isValidHex(val)) {
        const [h, s, l] = hexToHsl(val);
        isExternalUpdate.current = true;
        setHue(h);
        setSaturation(s);
        setLightness(l);
        onChange?.(val.toUpperCase());
      }
    },
    [onChange],
  );

  const handleEyeDropper = useCallback(async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const dropper = new EyeDropper();
      const result = await dropper.open();
      handleHexInput(result.sRGBHex);
    } catch {
      // User cancelled or API not available
    }
  }, [handleHexInput]);

  const hasEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  return (
    <div
      className={cn(
        "space-y-3",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <SaturationPanel
        hue={hue}
        saturation={saturation}
        lightness={lightness}
        onSaturationChange={setSaturation}
        onLightnessChange={setLightness}
      />
      <HueSlider hue={hue} onHueChange={setHue} />
      <div className="flex items-center gap-1.5">
        <Input
          className="h-8 font-mono text-xs pl-3 pr-2 uppercase flex-1"
          value={hexInput}
          onChange={(e) => handleHexInput(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          disabled={disabled}
        />
        {hasEyeDropper && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleEyeDropper}
            disabled={disabled}
          >
            <PipetteIcon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
