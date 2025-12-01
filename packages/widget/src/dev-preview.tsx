import { render } from 'preact';
import { WidgetRoot } from './components/WidgetRoot';
import type { WidgetData } from './types';
import './index.css';

// Mock Data
const mockData: WidgetData = {
    widgetId: 'dev-preview-widget',
    config: {
        layout: {
            type: 'grid',
            columns: 3,
        },
        theme: {
            mode: 'light',
            primaryColor: '#3b82f6',
            secondaryColor: '#64748b',
            cardStyle: 'default',
        },
        display: {
            showRating: true,
            showDate: true,
            showAvatar: true,
            showAuthorRole: true,
            showAuthorCompany: true,
        },
    },
    testimonials: [
        {
            id: '1',
            content: 'This widget is absolutely amazing! It was so easy to integrate and looks great on our website.',
            rating: 5,
            createdAt: new Date().toISOString(),
            isPublished: true,
            isApproved: true,
            isOAuthVerified: true,
            oauthProvider: 'google',
            author: {
                name: 'Sarah Johnson',
                role: 'Product Manager',
                company: 'TechCorp',
                avatar: 'https://i.pravatar.cc/150?u=1',
            },
        },
        {
            id: '2',
            content: 'I love the customization options. We were able to match our brand colors perfectly.',
            rating: 4,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            isPublished: true,
            isApproved: true,
            isOAuthVerified: false,
            author: {
                name: 'Michael Chen',
                role: 'Developer',
                company: 'StartupInc',
                avatar: 'https://i.pravatar.cc/150?u=2',
            },
        },
        {
            id: '3',
            content: 'The performance is top-notch. No impact on our page load times at all.',
            rating: 5,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            isPublished: true,
            isApproved: true,
            isOAuthVerified: true,
            oauthProvider: 'linkedin',
            author: {
                name: 'Emily Davis',
                role: 'CTO',
                company: 'Innovate',
                avatar: 'https://i.pravatar.cc/150?u=3',
            },
        },
        {
            id: '4',
            content: 'Highly recommended for anyone looking to showcase social proof.',
            rating: 5,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            isPublished: true,
            isApproved: true,
            isOAuthVerified: true,
            oauthProvider: 'twitter',
            author: {
                name: 'David Wilson',
                role: 'Marketing Director',
                company: 'GrowthHackers',
                avatar: 'https://i.pravatar.cc/150?u=4',
            },
        },
    ],
};

// Render function
function renderPreview() {
    const container = document.getElementById('app');
    if (!container) return;

    render(<WidgetRoot data={mockData} />, container);
}

// Initialize
renderPreview();
