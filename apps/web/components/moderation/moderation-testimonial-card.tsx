"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CustomAvatar } from "@workspace/ui/components/avatar";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Shield,
  Star,
  User,
  Mail,
  Loader2,
} from "lucide-react";
import { Testimonial } from "@/types/api";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";

interface ModerationTestimonialCardProps {
  testimonial: Testimonial;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  loadingAction?: string | null;
}

export function ModerationTestimonialCard({
  testimonial,
  onApprove,
  onReject,
  onDelete,
  isSelected,
  onToggleSelect,
  loadingAction = null,
}: ModerationTestimonialCardProps) {
  const riskScore = testimonial.moderationScore ?? 0;
  const flags = (testimonial.moderationFlags as string[]) ?? [];

  // Calculate risk level
  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return "High Risk";
    if (score >= 0.4) return "Medium Risk";
    if (score >= 0.2) return "Low Risk";
    return "Safe";
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <CustomAvatar
              src={testimonial.authorAvatar}
              name={testimonial.authorName}
              alt={testimonial.authorName}
              size="md"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">
                  {testimonial.authorName}
                </h3>
                {testimonial.isOAuthVerified && (
                  <Badge variant="secondary" className="text-xs bg-primary/5 border-primary/20">
                    <Shield className="h-3 w-3 mr-1 text-primary" />
                    Verified
                  </Badge>
                )}
              </div>
              {testimonial.authorEmail && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{testimonial.authorEmail}</span>
                </div>
              )}
              {(testimonial.authorRole || testimonial.authorCompany) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {testimonial.authorRole}
                  {testimonial.authorRole && testimonial.authorCompany && " · "}
                  {testimonial.authorCompany}
                </p>
              )}
            </div>
          </div>

          {/* Risk Badge */}
          {riskScore > 0.2 && (
            <Badge 
              variant="outline" 
              className={cn(
                "ml-2 flex-shrink-0",
                riskScore >= 0.7 && "border-destructive/30 text-destructive"
              )}
            >
              {riskLevel}
            </Badge>
          )}
        </div>

        {/* Content */}
        <p className="text-sm mb-4 whitespace-pre-wrap">
          {testimonial.content}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          {testimonial.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              <span>{testimonial.rating}/5</span>
            </div>
          )}
          <span>{formatDistanceToNow(new Date(testimonial.createdAt), { addSuffix: true })}</span>
        </div>

        {/* Moderation Notes */}
        {flags.length > 0 && (
          <div className="mb-4 p-3 rounded-md bg-muted/50 border">
            <p className="text-xs font-medium mb-2">Moderation Notes:</p>
            <ul className="space-y-1">
              {flags.map((flag, index) => (
                <li key={index} className="text-xs flex items-start gap-2">
                  <span className={cn(
                    flag.toLowerCase().includes('positive') || flag.toLowerCase().includes('auto-approved')
                      ? "text-green-600"
                      : "text-muted-foreground"
                  )}>•</span>
                  <span className="flex-1">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="outline">
            {testimonial.moderationStatus}
          </Badge>
          {testimonial.isPublished && (
            <Badge variant="secondary">Published</Badge>
          )}
          {testimonial.autoPublished && (
            <Badge variant="secondary">Auto-Approved</Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {testimonial.moderationStatus !== "APPROVED" && (
            <Button
              onClick={() => onApprove(testimonial.id)}
              size="sm"
              variant="default"
              className="bg-primary hover:bg-primary/90"
              disabled={loadingAction === 'approve'}
            >
              {loadingAction === 'approve' ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              Approve
            </Button>
          )}

          {testimonial.moderationStatus !== "REJECTED" && (
            <Button
              onClick={() => onReject(testimonial.id)}
              size="sm"
              variant="outline"
              disabled={loadingAction === 'reject'}
            >
              {loadingAction === 'reject' ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
          )}

          {/* Delete */}
          <Button
            onClick={() => onDelete(testimonial.id)}
            size="sm"
            variant="ghost"
            className="ml-auto"
            disabled={loadingAction === 'delete'}
          >
            {loadingAction === 'delete' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
