/**
 * Moderation Testimonial Card
 * Displays testimonial with moderation information and actions
 */

"use client";

import { useState } from "react";
import { Card } from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Flag,
  ShieldCheck,
  Star,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Testimonial, ModerationStatus } from "@/types/api";

interface ModerationTestimonialCardProps {
  testimonial: Testimonial;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onFlag: (id: string) => void;
}

export function ModerationTestimonialCard({
  testimonial,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onFlag,
}: ModerationTestimonialCardProps) {
  const [showFlags, setShowFlags] = useState(false);

  const getStatusBadge = (status: ModerationStatus) => {
    const variants = {
      PENDING: { icon: AlertCircle, label: "Pending", variant: "secondary" as const, color: "text-yellow-600" },
      FLAGGED: { icon: Flag, label: "Flagged", variant: "destructive" as const, color: "text-red-600" },
      APPROVED: { icon: CheckCircle, label: "Approved", variant: "default" as const, color: "text-green-600" },
      REJECTED: { icon: XCircle, label: "Rejected", variant: "outline" as const, color: "text-gray-600" },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getRiskBadge = (score: number | null) => {
    if (score === null) return null;

    if (score >= 0.7) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          High Risk
        </Badge>
      );
    } else if (score >= 0.4) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Medium Risk
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <CheckCircle className="h-3 w-3 text-green-600" />
        Low Risk
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {/* Selection Checkbox */}
        <div className="pt-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(testimonial.id, checked as boolean)}
          />
        </div>

        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={testimonial.authorAvatar || undefined} alt={testimonial.authorName} />
          <AvatarFallback>{getInitials(testimonial.authorName)}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{testimonial.authorName}</h3>
                {testimonial.isOAuthVerified && (
                  <div title="OAuth Verified">
                    <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                  </div>
                )}
              </div>
              {(testimonial.authorRole || testimonial.authorCompany) && (
                <p className="text-xs text-muted-foreground truncate">
                  {testimonial.authorRole}
                  {testimonial.authorRole && testimonial.authorCompany && " at "}
                  {testimonial.authorCompany}
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(testimonial.moderationStatus)}
              {getRiskBadge(testimonial.moderationScore)}
            </div>
          </div>

          {/* Testimonial Content */}
          <div className="mb-3">
            <p className="text-sm leading-relaxed line-clamp-3">{testimonial.content}</p>
          </div>

          {/* Rating */}
          {testimonial.rating && (
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < testimonial.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{testimonial.rating}/5</span>
            </div>
          )}

          {/* Moderation Flags */}
          {testimonial.moderationFlags && testimonial.moderationFlags.length > 0 && (
            <div className="mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFlags(!showFlags)}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <Flag className="h-3 w-3 mr-1" />
                {testimonial.moderationFlags.length} flag{testimonial.moderationFlags.length !== 1 ? "s" : ""}{" "}
                detected
                {showFlags ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>

              {showFlags && (
                <ul className="mt-2 space-y-1 pl-4 border-l-2 border-red-200">
                  {testimonial.moderationFlags.map((flag, index) => (
                    <li key={index} className="text-xs text-red-600">
                      • {flag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(testimonial.createdAt), { addSuffix: true })}
              {testimonial.autoPublished && (
                <span className="ml-2 text-green-600">• Auto-published</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {testimonial.moderationStatus !== "APPROVED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(testimonial.id)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              )}
              {testimonial.moderationStatus !== "REJECTED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(testimonial.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              )}
              {testimonial.moderationStatus !== "FLAGGED" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFlag(testimonial.id)}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  <Flag className="h-3 w-3 mr-1" />
                  Flag
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
