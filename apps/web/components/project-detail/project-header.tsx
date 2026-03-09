"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { SasImage } from "@/components/forms/fields/sas-image";
import {
  FolderIcon,
  Link2,
  Code,
  Check,
  MessageSquare,
  LayoutGrid,
} from "lucide-react";
import { EmbedDialog } from "./embed-dialog";
import type { Project } from "@/types/api";

interface ProjectHeaderProps {
  project: Project;
  slug: string;
  onDelete: () => Promise<void>;
}

export function ProjectHeader({ project, slug }: ProjectHeaderProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCollectionLink = async () => {
    const collectionUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/testimonials/${slug}`
        : "";
    await navigator.clipboard.writeText(collectionUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const testimonialCount = project._count?.testimonials ?? 0;
  const widgetCount = project._count?.widgets ?? 0;

  return (
    <div className="relative flex flex-col w-full rounded-lg overflow-hidden  backdrop-blur-xl border border-white/5 shadow-2xl ring-1 ring-white/5">
      {/* Cover Image Background */}
      <div className="h-32 sm:h-48 w-full bg-gradient-to-br from-blue-500/20 via-blue-900/10 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            className=" backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors h-8"
            onClick={handleCopyCollectionLink}
          >
            {linkCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 mr-2" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5 mr-2" />
                <span className="hidden sm:inline">Collection Link</span>
              </>
            )}
          </Button>

          <EmbedDialog
            project={project}
            trigger={
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white h-8 transition-shadow"
              >
                <Code className="h-3.5 w-3.5 sm:mr-2" />
                <span className="hidden sm:inline">Embed Code</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {/* Overlapping Avatar */}
        <div className="relative -mt-12 sm:-mt-16 mb-4 flex items-end justify-between">
          <div className="p-1.5 sm:p-2 bg-background rounded-lg ring-1 ring-white/10 shadow-xl">
            <Avatar className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg bg-zinc-900/50">
              <SasImage
                src={project.logoUrl}
                alt={project.name}
                className="w-full h-full object-cover rounded-lg"
                skeletonClassName="w-20 h-20 sm:w-28 sm:h-28 rounded-lg"
                showSkeleton
                fallback={
                  <AvatarFallback className="bg-blue-500/10 text-blue-500 rounded-lg w-full h-full">
                    <FolderIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500/50" />
                  </AvatarFallback>
                }
              />
            </Avatar>
          </div>

          {/* Integrated Stats Row */}
          <div className="hidden md:flex items-center gap-3 backdrop-blur-md border border-white/5 rounded-lg px-4 py-2 mt-4 self-end">
            <div className="flex items-center gap-2 pr-3 border-r border-white/10">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <div className="flex gap-2 items-center">
                <span className="text-sm font-bold text-white leading-none">
                  {testimonialCount}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                  Testimonials
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <LayoutGrid className="h-4 w-4 text-purple-400" />
              <div className="flex gap-2 items-center">
                <span className="text-sm font-bold text-white leading-none">
                  {widgetCount}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                  Widgets
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
              {project.name}
            </h1>
            {!project.isActive && (
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] uppercase tracking-wider"
              >
                Inactive
              </Badge>
            )}
            <span className="text-sm text-zinc-500 font-mono hidden sm:inline-block">
              /{project.slug}
            </span>
          </div>

          <p className="text-sm text-zinc-500 font-mono sm:hidden">
            /{project.slug}
          </p>

          {project.description && (
            <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
            <span>
              Created{" "}
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
