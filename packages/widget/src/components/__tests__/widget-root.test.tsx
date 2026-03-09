import { describe, expect, it } from 'vitest';
import { render } from 'preact';

import { WidgetRoot } from '../WidgetRoot';
import type { WidgetData } from '../../types';

if (!HTMLElement.prototype.scrollTo) {
  HTMLElement.prototype.scrollTo = () => undefined;
}

function createWidgetData(layoutType: WidgetData['config']['layout']['type']): WidgetData {
  return {
    widgetId: 'widget_1',
    config: {
      layout: {
        type: layoutType,
        maxTestimonials: 6,
      },
      theme: {
        mode: 'light',
        primaryColor: '#0066FF',
        secondaryColor: '#00CC99',
        cardStyle: 'default',
      },
      display: {
        showRating: true,
        showDate: true,
        showAvatar: true,
        showAuthorRole: true,
        showAuthorCompany: true,
        showBranding: true,
      },
    },
    testimonials: [
      {
        id: 't_1',
        content: 'Great product for our team.',
        createdAt: '2026-03-09T10:00:00.000Z',
        author: {
          name: 'Alice',
          role: 'Engineer',
          company: 'Acme',
        },
      },
      {
        id: 't_2',
        content: 'It improved our workflow.',
        createdAt: '2026-03-09T11:00:00.000Z',
        author: {
          name: 'Bob',
          role: 'PM',
          company: 'Acme',
        },
      },
    ],
  };
}

describe('WidgetRoot layout rendering', () => {
  it('renders grid layout', () => {
    const host = document.createElement('div');
    render(WidgetRoot({ data: createWidgetData('grid') }), host);

    expect(host.querySelector('.tresta-grid')).not.toBeNull();
  });

  it('renders list layout', () => {
    const host = document.createElement('div');
    render(WidgetRoot({ data: createWidgetData('list') }), host);

    expect(host.querySelector('.tresta-list')).not.toBeNull();
  });

  it('renders masonry layout', () => {
    const host = document.createElement('div');
    render(WidgetRoot({ data: createWidgetData('masonry') }), host);

    expect(host.querySelector('.tresta-masonry')).not.toBeNull();
  });

  it('renders carousel layout', () => {
    const host = document.createElement('div');
    render(WidgetRoot({ data: createWidgetData('carousel') }), host);

    expect(host.querySelector('.tresta-carousel')).not.toBeNull();
  });

  it('renders wall layout', () => {
    const host = document.createElement('div');
    render(WidgetRoot({ data: createWidgetData('wall') }), host);

    expect(host.querySelector('.tresta-wall')).not.toBeNull();
  });

  it('renders marquee layout', () => {
    const host = document.createElement('div');
    render(WidgetRoot({ data: createWidgetData('marquee') }), host);

    expect(host.querySelector('.tresta-marquee')).not.toBeNull();
  });

  it('sanitizes custom CSS before style injection', () => {
    const host = document.createElement('div');
    const data = createWidgetData('grid');
    data.config.display.customCss = 'a { color: red; background-image: url(javascript:alert(1)); }';

    render(WidgetRoot({ data }), host);

    const styleTag = host.querySelector('style');
    expect(styleTag).not.toBeNull();
    expect(styleTag?.innerHTML).toContain('/* [blocked] */');
    expect(styleTag?.innerHTML).not.toContain('javascript:');
  });
});
