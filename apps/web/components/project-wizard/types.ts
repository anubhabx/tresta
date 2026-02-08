/**
 * Types for Project Wizard Components
 */

import type { ProjectFormData } from "@/lib/schemas/project-schema";

// Industry presets matching Vercel's "Framework Presets" pattern
export type IndustryPreset = "SAAS" | "ECOMMERCE" | "AGENCY" | "OTHER";

// Color preset for project identity (when no logo)
export interface ColorPreset {
  id: string;
  bg: string;
  text: string;
  hex: string;
}

// Project identity for preview and display
export interface ProjectIdentity {
  name: string;
  slug: string;
  logoUrl?: string;
  accentColor?: ColorPreset;
  primaryColor?: string;
  secondaryColor?: string;
}

// Extended form data with wizard-specific fields
export interface ProjectWizardFormData extends ProjectFormData {
  industryPreset?: IndustryPreset;
}

// Preview configuration
export interface PreviewConfig {
  theme: "light" | "dark" | "auto" | "custom";
  layout: "widget" | "wall" | "form";
  showBranding: boolean;
}
