/**
 * TestimonialCard — Widget embed component
 *
 * Uses vanilla CSS classes (tresta-card-*) instead of Tailwind utilities
 * and inlines the Star SVG instead of importing lucide-preact.
 * This keeps the widget bundle lightweight.
 */

import { cn } from "@/lib/utils";
import type { Testimonial, DisplayOptions, ThemeConfig } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
  displayOptions: DisplayOptions;
  theme: ThemeConfig;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#eab308" : "none"}
      stroke={filled ? "#eab308" : "currentColor"}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="tresta-star"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function TestimonialCard({
  testimonial,
  displayOptions,
  theme,
}: TestimonialCardProps) {
  const isDark = theme.mode === "dark";
  const cardStyle = theme.cardStyle ?? "default";

  const cardClass = cn(
    "tresta-card",
    isDark ? "tresta-card--dark" : "tresta-card--light",
    `tresta-card--${cardStyle}`,
  );

  return (
    <div className={cardClass}>
      <div className="tresta-card__body">
        {/* Star Rating */}
        {displayOptions.showRating && testimonial.rating > 0 && (
          <div className="tresta-card__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= testimonial.rating} />
            ))}
          </div>
        )}

        {/* Content */}
        <p
          className={cn(
            "tresta-card__content",
            isDark
              ? "tresta-card__content--dark"
              : "tresta-card__content--light",
          )}
        >
          &quot;{testimonial.content}&quot;
        </p>

        {/* Author */}
        <div className="tresta-card__author">
          {displayOptions.showAvatar && (
            <div
              className={cn(
                "tresta-card__avatar",
                isDark
                  ? "tresta-card__avatar--dark"
                  : "tresta-card__avatar--light",
              )}
            >
              {testimonial.author.avatar ? (
                <img
                  src={testimonial.author.avatar}
                  alt={testimonial.author.name}
                  className="tresta-card__avatar-img"
                  loading="lazy"
                />
              ) : (
                <span className="tresta-card__avatar-initials">
                  {getInitials(testimonial.author.name)}
                </span>
              )}
            </div>
          )}

          <div>
            <div className="tresta-card__name-row">
              <p className="tresta-card__name">{testimonial.author.name}</p>
              {testimonial.isOAuthVerified && (
                <span
                  className="tresta-verification-badge"
                  title={`Verified via ${testimonial.oauthProvider ?? "OAuth"}`}
                  role="img"
                  aria-label={`Verified via ${testimonial.oauthProvider ?? "OAuth"}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="tresta-verification-badge__icon"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
              )}
            </div>
            {(displayOptions.showAuthorRole ||
              displayOptions.showAuthorCompany) && (
              <p className="tresta-card__meta">
                {displayOptions.showAuthorRole && testimonial.author.role}
                {displayOptions.showAuthorRole &&
                  displayOptions.showAuthorCompany &&
                  ", "}
                {displayOptions.showAuthorCompany && testimonial.author.company}
              </p>
            )}
          </div>
        </div>

        {/* Date */}
        {displayOptions.showDate && (
          <div
            className={cn(
              "tresta-card__date",
              isDark ? "tresta-card__date--dark" : "tresta-card__date--light",
            )}
          >
            {new Date(testimonial.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
