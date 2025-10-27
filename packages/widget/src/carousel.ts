/**
 * Enhanced Carousel Module
 * Provides smooth animations, touch support, and advanced carousel features
 * Styled with Tailwind CSS utilities
 */

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    company?: string;
    content: string;
    avatar?: string;
    rating?: number;
}

export interface CarouselOptions {
    container: HTMLElement;
    testimonials: Testimonial[];
    autoplay?: boolean;
    autoplaySpeed?: number;
    showRating?: boolean;
    showCompany?: boolean;
    onSlideChange?: (index: number) => void;
}

export class Carousel {
    private container: HTMLElement;
    private testimonials: Testimonial[];
    private currentIndex: number = 0;
    private autoplayInterval: number | null = null;
    private autoplay: boolean;
    private autoplaySpeed: number;
    private showRating: boolean;
    private showCompany: boolean;
    private onSlideChange?: (index: number) => void;
    private isAutoPlayActive: boolean;

    // Touch support
    private touchStartX: number = 0;
    private touchEndX: number = 0;
    private isDragging: boolean = false;

    // DOM elements
    private carouselCard: HTMLElement | null = null;
    private contentContainer: HTMLElement | null = null;
    private prevButton: HTMLElement | null = null;
    private nextButton: HTMLElement | null = null;
    private indicatorsContainer: HTMLElement | null = null;
    private autoplayToggle: HTMLElement | null = null;

    constructor(options: CarouselOptions) {
        this.container = options.container;
        this.testimonials = options.testimonials;
        this.autoplay = options.autoplay ?? true;
        this.autoplaySpeed = options.autoplaySpeed ?? 5000;
        this.showRating = options.showRating ?? true;
        this.showCompany = options.showCompany ?? true;
        this.onSlideChange = options.onSlideChange;
        this.isAutoPlayActive = this.autoplay;

        this.init();
    }

    private init(): void {
        if (!this.testimonials.length) {
            this.renderEmptyState();
            return;
        }

        this.render();
        this.setupControls();
        this.setupTouchSupport();
        this.setupKeyboardNavigation();

        if (this.autoplay) {
            this.startAutoplay();
            this.setupAutoplayPause();
        }
    }

    private renderEmptyState(): void {
        this.container.innerHTML = `
            <div class="tresta-carousel-empty">
                No testimonials available
            </div>
        `;
    }

    private render(): void {
        // Clear container
        this.container.innerHTML = '';
        this.container.className = 'tresta-carousel-container';

        // Create main structure
        const wrapper = document.createElement('div');
        wrapper.className = 'tresta-carousel-wrapper';

        // Create carousel card
        this.carouselCard = document.createElement('div');
        this.carouselCard.className = 'tresta-carousel-card';

        // Create content container with padding for arrows
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'tresta-carousel-content';

        this.carouselCard.appendChild(this.contentContainer);
        wrapper.appendChild(this.carouselCard);

        // Create navigation buttons
        this.prevButton = this.createNavigationButton('prev', 'Previous testimonial');
        this.nextButton = this.createNavigationButton('next', 'Next testimonial');

        wrapper.appendChild(this.prevButton);
        wrapper.appendChild(this.nextButton);

        this.container.appendChild(wrapper);

        // Create indicators
        this.indicatorsContainer = document.createElement('div');
        this.indicatorsContainer.className = 'tresta-carousel-indicators';
        this.container.appendChild(this.indicatorsContainer);

        // Create autoplay toggle
        const autoplayContainer = document.createElement('div');
        autoplayContainer.className = 'tresta-carousel-autoplay-container';
        this.autoplayToggle = document.createElement('button');
        this.autoplayToggle.className = 'tresta-carousel-autoplay-toggle';
        autoplayContainer.appendChild(this.autoplayToggle);
        this.container.appendChild(autoplayContainer);

        // Render indicators
        this.renderIndicators();

        // Render initial testimonial
        this.renderTestimonial();
    }

    private createNavigationButton(direction: 'prev' | 'next', label: string): HTMLElement {
        const button = document.createElement('button');
        button.setAttribute('data-action', direction);
        button.setAttribute('aria-label', label);
        button.className = `tresta-carousel-nav-button tresta-carousel-nav-${direction}`;

        // Create professional chevron SVG icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2.5');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // Professional chevron paths
        if (direction === 'prev') {
            path.setAttribute('d', 'M15 18l-6-6 6-6');
        } else {
            path.setAttribute('d', 'M9 18l6-6-6-6');
        }

        svg.appendChild(path);
        button.appendChild(svg);

        return button;
    }

    private renderIndicators(): void {
        if (!this.indicatorsContainer) return;

        this.indicatorsContainer.innerHTML = '';

        this.testimonials.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            indicator.setAttribute('data-index', String(index));
            indicator.className = index === this.currentIndex
                ? 'tresta-carousel-indicator tresta-carousel-indicator-active'
                : 'tresta-carousel-indicator';

            if (index === this.currentIndex) {
                indicator.setAttribute('aria-current', 'true');
            }

            if (this.indicatorsContainer) {
                this.indicatorsContainer.appendChild(indicator);
            }
        });
    }

    private renderTestimonial(): void {
        if (!this.contentContainer) return;

        const testimonial = this.testimonials[this.currentIndex];
        if (!testimonial) return;

        this.contentContainer.innerHTML = '';

        // Rating
        if (this.showRating && testimonial.rating) {
            const ratingContainer = document.createElement('div');
            ratingContainer.className = 'tresta-carousel-rating';

            for (let i = 0; i < 5; i++) {
                const star = this.createStarIcon(i < testimonial.rating);
                ratingContainer.appendChild(star);
            }

            this.contentContainer.appendChild(ratingContainer);
        }

        // Testimonial text - wrapped in a container for proper flex behavior
        const quoteContainer = document.createElement('div');
        quoteContainer.className = 'tresta-carousel-quote-container';

        const blockquote = document.createElement('blockquote');
        blockquote.className = 'tresta-carousel-quote';
        blockquote.textContent = `"${testimonial.content}"`;

        quoteContainer.appendChild(blockquote);
        this.contentContainer.appendChild(quoteContainer);

        // Author info
        const authorContainer = document.createElement('div');
        authorContainer.className = 'tresta-carousel-author';

        // Only show avatar if available (skip for now as per requirements)
        // Avatar support can be added later when needed

        const authorInfo = document.createElement('div');
        authorInfo.className = 'tresta-carousel-author-info';

        const name = document.createElement('p');
        name.className = 'tresta-carousel-author-name';
        name.textContent = testimonial.name;
        authorInfo.appendChild(name);

        const role = document.createElement('p');
        role.className = 'tresta-carousel-author-role';
        let roleText = testimonial.role;
        if (this.showCompany && testimonial.company) {
            roleText += ` at ${testimonial.company}`;
        }
        role.textContent = roleText;
        authorInfo.appendChild(role);

        authorContainer.appendChild(authorInfo);
        this.contentContainer.appendChild(authorContainer);

        // Update autoplay toggle
        this.updateAutoplayToggle();
    }

    private createStarIcon(filled: boolean): SVGElement {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', filled ? 'currentColor' : 'none');
        svg.setAttribute('stroke', filled ? 'currentColor' : 'currentColor');
        svg.setAttribute('stroke-width', '1.5');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('class', filled ? 'tresta-carousel-star-filled' : 'tresta-carousel-star-empty');

        // Professional star icon path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');

        svg.appendChild(path);
        return svg;
    }

    private updateAutoplayToggle(): void {
        if (!this.autoplayToggle) return;

        // Clear existing content
        this.autoplayToggle.innerHTML = '';

        // Create icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('stroke', 'none');
        svg.style.marginRight = '6px';

        if (this.isAutoPlayActive) {
            // Pause icon (two vertical bars)
            const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect1.setAttribute('x', '6');
            rect1.setAttribute('y', '4');
            rect1.setAttribute('width', '4');
            rect1.setAttribute('height', '16');
            rect1.setAttribute('rx', '1');

            const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect2.setAttribute('x', '14');
            rect2.setAttribute('y', '4');
            rect2.setAttribute('width', '4');
            rect2.setAttribute('height', '16');
            rect2.setAttribute('rx', '1');

            svg.appendChild(rect1);
            svg.appendChild(rect2);
        } else {
            // Play icon (triangle)
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M8 5v14l11-7z');
            svg.appendChild(path);
        }

        this.autoplayToggle.appendChild(svg);

        // Add text
        const text = document.createTextNode(this.isAutoPlayActive ? 'Pause' : 'Play');
        this.autoplayToggle.appendChild(text);
    }

    private setupControls(): void {
        this.prevButton?.addEventListener('click', () => this.prev());
        this.nextButton?.addEventListener('click', () => this.next());

        // Setup indicator clicks
        if (this.indicatorsContainer) {
            this.indicatorsContainer.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const index = target.getAttribute('data-index');
                if (index !== null) {
                    this.goToSlide(parseInt(index, 10));
                }
            });
        }

        // Setup autoplay toggle
        this.autoplayToggle?.addEventListener('click', () => {
            this.isAutoPlayActive = !this.isAutoPlayActive;
            if (this.isAutoPlayActive) {
                this.startAutoplay();
            } else {
                this.stopAutoplay();
            }
            this.updateAutoplayToggle();
        });
    }

    private setupTouchSupport(): void {
        if (!this.carouselCard) return;

        this.carouselCard.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (touch) {
                this.touchStartX = touch.clientX;
                this.isDragging = true;
            }
        }, { passive: true });

        this.carouselCard.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const touch = e.touches[0];
            if (touch) {
                this.touchEndX = touch.clientX;
            }
        }, { passive: true });

        this.carouselCard.addEventListener('touchend', () => {
            if (!this.isDragging) return;
            this.isDragging = false;

            const diff = this.touchStartX - this.touchEndX;
            const threshold = 50; // Minimum swipe distance

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });

        // Mouse drag support for desktop
        let mouseStartX = 0;
        let isMouseDragging = false;

        this.carouselCard.addEventListener('mousedown', (e) => {
            mouseStartX = e.clientX;
            isMouseDragging = true;
            if (this.carouselCard) {
                this.carouselCard.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isMouseDragging || !this.carouselCard) return;
            // Visual feedback during drag could be added here
        });

        document.addEventListener('mouseup', (e) => {
            if (!isMouseDragging || !this.carouselCard) return;
            isMouseDragging = false;
            if (this.carouselCard) {
                this.carouselCard.style.cursor = 'grab';
            }

            const diff = mouseStartX - e.clientX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });
    }

    private setupKeyboardNavigation(): void {
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.next();
            }
        });

        // Make container focusable
        this.container.setAttribute('tabindex', '0');
    }

    private setupAutoplayPause(): void {
        if (!this.carouselCard) return;

        this.carouselCard.addEventListener('mouseenter', () => {
            if (this.isAutoPlayActive) {
                this.stopAutoplay();
            }
        });

        this.carouselCard.addEventListener('mouseleave', () => {
            if (this.isAutoPlayActive) {
                this.startAutoplay();
            }
        });

        // Pause on focus (accessibility)
        this.container.addEventListener('focus', () => {
            if (this.isAutoPlayActive) {
                this.stopAutoplay();
            }
        });

        this.container.addEventListener('blur', () => {
            if (this.isAutoPlayActive) {
                this.startAutoplay();
            }
        });
    }

    public goToSlide(index: number): void {
        // Handle wrapping
        if (index < 0) {
            index = this.testimonials.length - 1;
        } else if (index >= this.testimonials.length) {
            index = 0;
        }

        this.currentIndex = index;

        // Re-render testimonial with fade effect
        if (this.contentContainer) {
            this.contentContainer.style.opacity = '0';
            this.contentContainer.style.transition = 'opacity 0.3s ease-in-out';

            setTimeout(() => {
                this.renderTestimonial();
                this.renderIndicators();

                if (this.contentContainer) {
                    this.contentContainer.style.opacity = '1';
                }
            }, 150);
        }

        // Callback
        if (this.onSlideChange) {
            this.onSlideChange(index);
        }
    }

    public next(): void {
        this.goToSlide(this.currentIndex + 1);
        // Pause autoplay temporarily when user interacts
        if (this.isAutoPlayActive) {
            this.stopAutoplay();
            setTimeout(() => {
                if (this.isAutoPlayActive) {
                    this.startAutoplay();
                }
            }, 10000); // Resume after 10 seconds
        }
    }

    public prev(): void {
        this.goToSlide(this.currentIndex - 1);
        // Pause autoplay temporarily when user interacts
        if (this.isAutoPlayActive) {
            this.stopAutoplay();
            setTimeout(() => {
                if (this.isAutoPlayActive) {
                    this.startAutoplay();
                }
            }, 10000); // Resume after 10 seconds
        }
    }

    public startAutoplay(): void {
        this.stopAutoplay();
        this.autoplayInterval = window.setInterval(() => {
            this.next();
        }, this.autoplaySpeed);
    }

    public stopAutoplay(): void {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    public destroy(): void {
        this.stopAutoplay();
        // Remove event listeners would go here if we tracked them
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public getTotalTestimonials(): number {
        return this.testimonials.length;
    }

    public getTestimonials(): Testimonial[] {
        return this.testimonials;
    }

    public setTestimonials(testimonials: Testimonial[]): void {
        this.testimonials = testimonials;
        this.currentIndex = 0;
        this.init();
    }
}
