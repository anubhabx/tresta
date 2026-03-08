import { render } from 'preact';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestimonialCard } from '../TestimonialCard';
import type { DisplayOptions, Testimonial, ThemeConfig } from '../../types';

describe('TestimonialCard', () => {
  let container: HTMLDivElement;
  let testimonial: Testimonial;
  let displayOptions: DisplayOptions;
  let theme: ThemeConfig;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    testimonial = {
      id: 'test-123',
      content: 'This is a great product! Highly recommend it.',
      rating: 5,
      createdAt: '2025-11-17T10:00:00Z',
      isPublished: true,
      isApproved: true,
      isOAuthVerified: true,
      oauthProvider: 'Google',
      author: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg',
        role: 'CEO',
        company: 'Acme Corp',
      },
    };

    displayOptions = {
      showRating: true,
      showDate: true,
      showAvatar: true,
      showAuthorRole: true,
      showAuthorCompany: true,
    };

    theme = {
      mode: 'light',
      primaryColor: '#0066cc',
      secondaryColor: '#6b7280',
      fontFamily: 'Arial, sans-serif',
      cardStyle: 'default',
    };
  });

  afterEach(() => {
    render(null, container);
    container.remove();
  });

  function mount(overrides?: {
    testimonial?: Testimonial;
    displayOptions?: DisplayOptions;
    theme?: ThemeConfig;
  }) {
    render(
      TestimonialCard({
        testimonial: overrides?.testimonial ?? testimonial,
        displayOptions: overrides?.displayOptions ?? displayOptions,
        theme: overrides?.theme ?? theme,
      }),
      container,
    );

    return container;
  }

  it('renders testimonial content, author info, and verification badge', () => {
    const view = mount();

    expect(view.querySelector('article.tresta-testimonial-card')).toBeTruthy();
    expect(view.textContent).toContain('This is a great product! Highly recommend it.');
    expect(view.querySelector('.tresta-card__name')?.textContent).toBe('John Doe');
    expect(view.querySelector('.tresta-verification-badge')).toBeTruthy();
  });

  it('renders an avatar image when avatar display is enabled', () => {
    const view = mount();
    const avatar = view.querySelector('.tresta-card__avatar-img') as HTMLImageElement | null;

    expect(avatar).toBeTruthy();
    expect(avatar?.getAttribute('src')).toBe('https://example.com/avatar.jpg');
    expect(avatar?.getAttribute('alt')).toBe('John Doe');
  });

  it('falls back to initials when avatar is missing', () => {
    const view = mount({
      testimonial: {
        ...testimonial,
        author: {
          ...testimonial.author,
          avatar: undefined,
        },
      },
    });

    expect(view.querySelector('.tresta-card__avatar-img')).toBeNull();
    expect(view.querySelector('.tresta-card__avatar-initials')?.textContent).toBe('JD');
  });

  it('hides optional metadata when display flags are disabled', () => {
    const view = mount({
      displayOptions: {
        ...displayOptions,
        showRating: false,
        showDate: false,
        showAuthorRole: false,
        showAuthorCompany: false,
      },
    });

    expect(view.querySelector('.tresta-card__stars')).toBeNull();
    expect(view.querySelector('.tresta-card__date')).toBeNull();
    expect(view.querySelector('.tresta-card__meta')).toBeNull();
  });

  it('applies the dark card modifier when theme mode is dark', () => {
    const view = mount({
      theme: {
        ...theme,
        mode: 'dark',
        cardStyle: 'glass',
      },
    });

    const card = view.querySelector('.tresta-card');
    expect(card?.className).toContain('tresta-card--dark');
    expect(card?.className).toContain('tresta-card--glass');
  });
});