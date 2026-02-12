/**
 * Carousel Layout
 *
 * Horizontal slider with auto-rotation, navigation arrows,
 * dot indicators, and touch/swipe support.
 * Uses pure CSS scroll-snap for smooth, performant sliding.
 */

import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { TestimonialCard } from "../TestimonialCard";
import type { LayoutProps } from "./types";

export function CarouselLayout({
  testimonials,
  displayOptions,
  theme,
  layout,
}: LayoutProps) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = testimonials.length;

  const autoRotate = layout.autoRotate ?? false;
  const interval = layout.rotateInterval ?? 5000;
  const showNav = layout.showNavigation !== false;

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || total <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, interval);
    return () => clearInterval(timer);
  }, [autoRotate, interval, total]);

  // Scroll to current slide
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[current] as HTMLElement | undefined;
    if (slide) {
      slide.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [current]);

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(((idx % total) + total) % total);
    },
    [total],
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  return (
    <div
      className="tresta-carousel"
      style={{ position: "relative", width: "100%" }}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="tresta-carousel-track"
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          gap: "16px",
        }}
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="tresta-carousel-slide"
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              minWidth: 0,
            }}
          >
            <TestimonialCard
              testimonial={testimonial}
              displayOptions={displayOptions}
              theme={theme}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showNav && total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="tresta-carousel-prev"
            aria-label="Previous testimonial"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            className="tresta-carousel-next"
            aria-label="Next testimonial"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {total > 1 && (
        <div className="tresta-carousel-dots">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              className={`tresta-carousel-dot ${idx === current ? "active" : ""}`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
