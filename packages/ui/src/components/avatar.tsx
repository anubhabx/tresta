"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@workspace/ui/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * Custom Avatar component with automatic initials generation
 */
interface CustomAvatarProps {
  src?: string | null;
  alt?: string;
  name: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "size-6 text-xs",
  sm: "size-8 text-sm",
  md: "size-10 text-base",
  lg: "size-12 text-lg",
  xl: "size-16 text-xl",
};

/**
 * Generate initials from a name
 * Examples: "John Doe" -> "JD", "Alice" -> "A", "Bob Smith Jr" -> "BS"
 */
function getInitials(name: string): string {
  if (!name) return "?";
  
  const parts = name.trim().split(/\s+/).filter(Boolean);
  
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }
  
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/**
 * Generate a consistent color based on name
 * Uses a simple hash function to generate a hue value
 */
function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

export function CustomAvatar({ src, alt, name, className, size = "md" }: CustomAvatarProps) {
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src || undefined} alt={alt || name} />
      <AvatarFallback 
        style={{ backgroundColor }}
        className="text-white font-semibold"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback }
