"use client";

import { cn } from "@workspace/ui/lib/utils";
import React from "react";

/**
 * BentoGrid — Aceternity-inspired responsive bento layout.
 *
 * Adapted for Tresta's dark zinc theme.
 * Usage:
 *   <BentoGrid>
 *     <BentoGridItem title="..." header={<MyVisual />} />
 *   </BentoGrid>
 */
export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-5xl grid-cols-1 gap-4 md:auto-rows-[20rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition duration-200 hover:border-zinc-700 hover:shadow-xl hover:shadow-primary/5",
        className,
      )}
    >
      {/* Header — the main graphic / visual area */}
      <div className="mb-4 min-h-0 flex-1">{header}</div>

      {/* Text content — slides right on hover */}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div className="mt-2 mb-1 font-sans text-base font-bold text-zinc-100">
          {title}
        </div>
        <div className="font-sans text-sm font-normal text-zinc-400 leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
