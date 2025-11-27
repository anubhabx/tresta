'use client';

import { useEffect, useRef, useState } from 'react';
import type { WidgetConfig } from '@workspace/types';

interface WidgetPreviewProps {
  widgetId: string;
  config: WidgetConfig;
}

export function WidgetPreview({ widgetId, config }: WidgetPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return () => undefined;
    }

    let isActive = true;
    const startFrame = requestAnimationFrame(() => {
      if (isActive) {
        setIsLoading(true);
      }
    });

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) {
      cancelAnimationFrame(startFrame);
      return () => {
        isActive = false;
      };
    }

    // Build the preview HTML with the widget
    const previewHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Widget Preview</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: ${config.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            padding: 20px;
            min-height: 100vh;
          }
          .preview-container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .preview-note {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            color: #0c4a6e;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="preview-note">
            Live Preview - This shows how your widget will appear on your website
          </div>
          <div id="tresta-widget-${widgetId}" 
               data-widget-id="${widgetId}"
               data-layout="${config.layout || 'grid'}"
               data-theme="${config.theme || 'light'}"
               data-primary-color="${config.primaryColor || '#0066FF'}"
               data-secondary-color="${config.secondaryColor || '#00CC99'}"
               data-show-rating="${config.showRating !== false}"
               data-show-date="${config.showDate !== false}"
               data-show-avatar="${config.showAvatar || false}"
               data-show-author-role="${config.showAuthorRole !== false}"
               data-show-author-company="${config.showAuthorCompany !== false}"
               data-max-testimonials="${config.maxTestimonials || 10}"
               data-card-style="${config.cardStyle || 'default'}"
               data-auto-rotate="${config.autoRotate || false}"
               data-rotate-interval="${config.rotateInterval || 5000}"
               data-show-navigation="${config.showNavigation !== false}"
               data-columns="${config.columns || 3}">
          </div>
          <script>
            // Mock widget initialization for preview
            (function() {
              const container = document.getElementById('tresta-widget-${widgetId}');
              if (!container) return;

              // Create mock testimonials
              const mockTestimonials = [
                {
                  id: '1',
                  content: 'This product has completely transformed how we work. The team is responsive and the features are exactly what we needed.',
                  rating: 5,
                  authorName: 'Sarah Johnson',
                  authorRole: 'CEO',
                  authorCompany: 'TechCorp Inc.',
                  authorImage: 'https://i.pravatar.cc/150?img=1',
                  createdAt: new Date().toISOString()
                },
                {
                  id: '2',
                  content: 'Outstanding service and support. Highly recommend to anyone looking for a reliable solution.',
                  rating: 5,
                  authorName: 'Michael Chen',
                  authorRole: 'Product Manager',
                  authorCompany: 'StartupXYZ',
                  authorImage: 'https://i.pravatar.cc/150?img=2',
                  createdAt: new Date().toISOString()
                },
                {
                  id: '3',
                  content: 'Great experience from start to finish. The platform is intuitive and powerful.',
                  rating: 4,
                  authorName: 'Emily Rodriguez',
                  authorRole: 'Marketing Director',
                  authorCompany: 'Growth Co',
                  authorImage: 'https://i.pravatar.cc/150?img=3',
                  createdAt: new Date().toISOString()
                }
              ];

              // Get config from data attributes
              const layout = container.dataset.layout || 'grid';
              const theme = container.dataset.theme || 'light';
              const primaryColor = container.dataset.primaryColor || '#0066FF';
              const showRating = container.dataset.showRating !== 'false';
              const showDate = container.dataset.showDate !== 'false';
              const showAvatar = container.dataset.showAvatar === 'true';
              const showAuthorRole = container.dataset.showAuthorRole !== 'false';
              const showAuthorCompany = container.dataset.showAuthorCompany !== 'false';
              const maxTestimonials = parseInt(container.dataset.maxTestimonials || '10');
              const cardStyle = container.dataset.cardStyle || 'default';
              const columns = parseInt(container.dataset.columns || '3');

              // Render testimonials
              const testimonials = mockTestimonials.slice(0, maxTestimonials);
              
              let html = '<div style="display: grid; grid-template-columns: repeat(' + columns + ', 1fr); gap: 24px;">';
              
              testimonials.forEach(t => {
                const cardBg = theme === 'dark' ? '#2a2a2a' : '#ffffff';
                const textColor = theme === 'dark' ? '#ffffff' : '#1a1a1a';
                const mutedColor = theme === 'dark' ? '#a0a0a0' : '#666666';
                
                let cardClass = 'padding: 24px; border-radius: 12px; background: ' + cardBg + '; color: ' + textColor + ';';
                if (cardStyle === 'bordered') {
                  cardClass += ' border: 2px solid ' + primaryColor + ';';
                } else if (cardStyle === 'minimal') {
                  cardClass += ' box-shadow: none; border: 1px solid #e5e5e5;';
                } else {
                  cardClass += ' box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
                }
                
                html += '<div style="' + cardClass + '">';
                
                if (showRating && t.rating) {
                  html += '<div style="color: ' + primaryColor + '; margin-bottom: 12px;">';
                  for (let i = 0; i < t.rating; i++) {
                    html += '★';
                  }
                  html += '</div>';
                }
                
                html += '<p style="margin-bottom: 16px; line-height: 1.6;">' + t.content + '</p>';
                
                html += '<div style="display: flex; align-items: center; gap: 12px;">';
                
                if (showAvatar && t.authorImage) {
                  html += '<img src="' + t.authorImage + '" alt="' + t.authorName + '" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">';
                }
                
                html += '<div>';
                html += '<div style="font-weight: 600; margin-bottom: 4px;">' + t.authorName + '</div>';
                
                if (showAuthorRole || showAuthorCompany) {
                  html += '<div style="font-size: 14px; color: ' + mutedColor + ';">';
                  if (showAuthorRole && t.authorRole) html += t.authorRole;
                  if (showAuthorRole && showAuthorCompany && t.authorRole && t.authorCompany) html += ' at ';
                  if (showAuthorCompany && t.authorCompany) html += t.authorCompany;
                  html += '</div>';
                }
                
                if (showDate) {
                  html += '<div style="font-size: 12px; color: ' + mutedColor + '; margin-top: 4px;">' + new Date(t.createdAt).toLocaleDateString() + '</div>';
                }
                
                html += '</div></div></div>';
              });
              
              html += '</div>';
              
              container.innerHTML = html;
            })();
          </script>
        </div>
      </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(previewHTML);
    iframeDoc.close();

    const endFrame = requestAnimationFrame(() => {
      if (isActive) {
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
      cancelAnimationFrame(startFrame);
      cancelAnimationFrame(endFrame);
    };
  }, [widgetId, config]);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="text-gray-600 dark:text-gray-400">Loading preview...</div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full min-h-[600px] border-0"
        title="Widget Preview"
        sandbox="allow-scripts"
      />
    </div>
  );
}
