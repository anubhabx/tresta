"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

/**
 * Detects if a segment looks like a machine-generated ID
 * (UUID, CUID, nanoid, etc.) rather than a human-readable slug.
 */
const isIdLike = (segment: string): boolean => {
  // UUIDs: 8-4-4-4-12 hex
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment,
    )
  )
    return true;
  // CUIDs / nanoids / generic long alphanumeric IDs (16+ chars, mostly alnum)
  if (segment.length >= 16 && /^[a-z0-9]+$/i.test(segment)) return true;
  return false;
};

/**
 * Truncates a long ID to first 8 chars + "…"
 */
const truncateId = (id: string, maxLen = 8): string => {
  if (id.length <= maxLen) return id;
  return `${id.slice(0, maxLen)}…`;
};

const formatSegment = (segment: string) => {
  let formatted = segment.replace(/[-_]/g, " ");
  formatted = formatted.replace(/\b\w/g, (char) => char.toUpperCase());
  return formatted;
};

const UIBreadcrumb = () => {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const idLike = isIdLike(segment);
    const label = idLike ? truncateId(segment) : formatSegment(segment);
    const fullLabel = idLike ? segment : undefined;

    return {
      href,
      label,
      fullLabel,
      isLast,
    };
  });

  // If we're at the root, show "Dashboard"
  if (breadcrumbItems.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.fullLabel ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {item.isLast ? (
                      <BreadcrumbPage className="max-w-[120px] truncate font-mono text-xs">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href}
                          className="max-w-[120px] truncate font-mono text-xs"
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="font-mono text-xs">{item.fullLabel}</p>
                  </TooltipContent>
                </Tooltip>
              ) : item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default UIBreadcrumb;
