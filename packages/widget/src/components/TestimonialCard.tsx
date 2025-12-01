import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Testimonial, DisplayOptions, ThemeConfig } from "@/types"
import { Star } from "lucide-preact"

interface TestimonialCardProps {
    testimonial: Testimonial
    displayOptions: DisplayOptions
    theme: ThemeConfig
}

export function TestimonialCard({ testimonial, displayOptions, theme }: TestimonialCardProps) {
    const isDark = theme.mode === 'dark'

    return (
        <Card
            className={cn(
                "transition-all duration-300 h-full",
                isDark
                    ? "border-zinc-800 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-900"
            )}
        >
            <CardContent className="p-6 flex flex-col h-full">
                {displayOptions.showRating && testimonial.rating > 0 && (
                    <div className="mb-4 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    "h-4 w-4",
                                    star <= testimonial.rating
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "text-zinc-300 dark:text-zinc-700"
                                )}
                            />
                        ))}
                    </div>
                )}

                <p
                    className={cn(
                        "mb-4 text-sm flex-grow",
                        isDark ? "text-zinc-400" : "text-zinc-600"
                    )}
                >
                    &quot;{testimonial.content}&quot;
                </p>

                <div className="flex items-center gap-3 mt-auto">
                    {displayOptions.showAvatar && (
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center overflow-hidden shrink-0",
                            isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
                        )}>
                            {testimonial.author.avatar ? (
                                <img
                                    src={testimonial.author.avatar}
                                    alt={testimonial.author.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="text-xs font-medium">
                                    {getInitials(testimonial.author.name)}
                                </span>
                            )}
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-semibold">{testimonial.author.name}</p>
                        {(displayOptions.showAuthorRole || displayOptions.showAuthorCompany) && (
                            <p
                                className={cn(
                                    "text-xs",
                                    isDark ? "text-zinc-500" : "text-zinc-500"
                                )}
                            >
                                {displayOptions.showAuthorRole && testimonial.author.role}
                                {displayOptions.showAuthorRole && displayOptions.showAuthorCompany && ", "}
                                {displayOptions.showAuthorCompany && testimonial.author.company}
                            </p>
                        )}
                    </div>
                </div>

                {displayOptions.showDate && (
                    <div className={cn("mt-4 text-xs", isDark ? "text-zinc-600" : "text-zinc-400")}>
                        {new Date(testimonial.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
