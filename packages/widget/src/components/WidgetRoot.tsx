import { TestimonialCard } from "./TestimonialCard"
import type { WidgetData } from "@/types"


interface WidgetRootProps {
    data: WidgetData
}

export function WidgetRoot({ data }: WidgetRootProps) {
    const { testimonials, config } = data
    const { layout, display, theme } = config

    // Apply theme mode to a wrapper or handle it via context if needed.
    // For now, we pass it down.

    // Handle layout types (grid, list, masonry, etc.)
    // Simplified for now to grid/list based on config

    const gridCols = layout.type === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'

    return (
        <div className={`tresta-widget-root w-full ${theme.mode === 'dark' ? 'dark' : ''}`}>
            <div className={`grid gap-4 ${gridCols}`}>
                {testimonials.map(testimonial => (
                    <TestimonialCard
                        key={testimonial.id}
                        testimonial={testimonial}
                        displayOptions={display}
                        theme={theme}
                    />
                ))}
            </div>

            {/* Branding Badge could go here */}
            <div className="mt-4 flex justify-center">
                <a href="https://tresta.dev" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#00796b] transition-colors">
                    Powered by Tresta
                </a>
            </div>
        </div>
    )
}
