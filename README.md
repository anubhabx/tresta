# Tresta - Testimonial Management Platform

**A modern, full-stack platform for collecting, managing, and displaying customer testimonials with embeddable widgets.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-green)](https://www.prisma.io/)
[![MVP Progress](https://img.shields.io/badge/MVP-97%25-brightgreen)](PROJECT_STATUS.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **📊 Project Status:** 97% complete - [View detailed status report](PROJECT_STATUS.md)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🌟 Overview

Tresta is a comprehensive testimonial management platform that enables businesses to:

- 🎯 Collect verified testimonials from customers via customizable forms
- 🛡️ Automatically moderate content with advanced sentiment analysis
- ✅ Manage and moderate testimonials with OAuth verification and bulk actions
- 🎨 Display testimonials on any website using embeddable widgets
- 📊 Track testimonial performance and analytics

Built as a **Turborepo monorepo** with modern TypeScript tooling, Tresta provides a seamless experience for both platform owners and end-users.

**Recent Updates (November 2025):**

- ✅ Live widget preview embedded in the dashboard builder with instant config sync
- ✅ WCAG 2.1 AA accessibility sweep for the widget (keyboard nav, ARIA, live regions)
- ✅ CSP compliance toolkit with runtime validator + CI audit script
- ✅ Auto-moderation system with heuristic rules and optional AI classification
- ✅ Google OAuth verification with trust badges
- ✅ Custom account settings with GDPR compliance
- ✅ Integrated moderation UI with bulk actions

---

## ✨ Features

### Core Features (MVP - Completed)

- ✅ **OAuth Verification** - Google Sign-In for verified testimonials with trust badges
- ✅ **Auto-Moderation** - Hybrid moderation with heuristic rules and optional AI classification (OpenAI Moderation API)
- ✅ **Avatar Support** - Auto-sync from OAuth providers, Azure Blob Storage integration
- ✅ **Embeddable Widgets** - Standalone JavaScript widgets (carousel, grid, masonry, wall, list, marquee)
- ✅ **Project Management** - Create and manage multiple testimonial projects
- ✅ **Testimonial Forms** - Public-facing forms with customizable branding
- ✅ **Admin Dashboard** - Full-featured management interface with bulk moderation
- ✅ **Source Tracking** - IP address, user agent, and source metadata capture
- ✅ **Custom Account Settings** - Profile management with privacy transparency page
- ✅ **Data Export & Deletion** - GDPR-compliant data portability and account deletion

### Moderation Features

- 🛡️ **Sentiment Analysis** - Weighted keyword detection with negation handling and 5-category scoring
- 🤖 **Profanity Detection** - Multi-category filtering (severe, mild, offensive) with obfuscation detection
- 🚫 **Spam Detection** - Pattern matching for excessive caps, repetition, URLs, and promotional language
- 🧠 **AI Classification** - Optional OpenAI Moderation API integration for hate speech, harassment, and violence detection
- 📊 **Risk Scoring** - 0-1 scale for problematic content identification
- ⚙️ **Project-Level Settings** - Configurable moderation rules and auto-approval
- 🔍 **Inline Moderation UI** - Integrated filters, badges, and bulk actions
- 📦 **Batch Processing** - Bulk approve/flag/reject with fixed action bar
- 🔄 **Migration Tools** - Scripts to moderate existing testimonials

### Widget Features

- 🎨 **6 Layout Types**: Carousel, Grid, Masonry, Wall, List, Marquee
- 🎭 **Theme Customization**: Colors, fonts, border radius via data attributes
- 🔧 **Configurable Settings**: Ratings, dates, author info, autoplay
- 📦 **Lightweight**: Preact-based widget (~42 KB gzipped), CDN-ready
- ⚡ **Auto-initialization**: Detects and initializes from script tags
- 🎯 **Performance**: Optimized IIFE bundle for fast loading
- ✅ **Verified Badges**: Display OAuth verification status in all layouts
- ♿ **Accessibility**: WCAG 2.1 AA compliant (keyboard nav, focus states, screen readers)
- 🛡️ **CSP Compliance**: Runtime validator + CI audit script for strict security policies
- 🧪 **Dashboard Live Preview**: Real-time preview panel with layout switching + loading states

### Authentication & Security

- 🔐 **Clerk Authentication** - Secure user management and OAuth
- 🛡️ **CORS Protection** - Configured for secure cross-origin requests
- 🔒 **JWT Tokens** - Bearer token authentication for API
- 🔑 **OAuth Providers** - Google (testimonial verification), GitHub (platform login)
- 🚫 **Rate Limiting** - Redis-backed multi-tier protection (API, email, admin, public, per-key)

### Coming Soon (In Development)

- 📊 **Analytics Dashboard** - Detailed source tracking and performance metrics
- 🎬 **Rich Media** - Video and audio testimonial support (routes implemented)
- 🌐 **Multi-Language** - Internationalization support
- 🔗 **Webhooks** - Integration with external services
- 🧠 **Smart AI Selection** - Intelligent testimonial optimization

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: [Clerk](https://clerk.com/)
- **State Management**: TanStack Query v5 + Zustand
- **Forms**: react-hook-form + Zod validation
- **OAuth**: @react-oauth/google

### Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Clerk Express SDK
- **File Storage**: Azure Blob Storage
- **OAuth Verification**: google-auth-library

### Widget

- **Framework**: Preact (lightweight React alternative)
- **Build**: Vite (IIFE format)
- **Distribution**: CDN-ready standalone library
- **Dependencies**: clsx, DOMPurify

### Infrastructure

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript strict mode
- **Database Migrations**: Prisma Migrate

---

## 🏗️ Architecture

```
tresta/
├── apps/
│   ├── web/                 # Next.js 15 frontend (App Router)
│   │   ├── app/             # Routes and layouts
│   │   │   ├── (auth)/      # Auth routes (sign-in, sign-up)
│   │   │   ├── (dashboard)/ # Protected dashboard routes
│   │   │   └── (public)/    # Public testimonial submission
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities, queries, schemas
│   │   └── hooks/           # Custom React hooks
│   │
│   └── api/                 # Express API server
│       ├── src/
│       │   ├── controllers/ # Route handlers
│       │   ├── middleware/  # Authentication, CORS, error handling
│       │   ├── routes/      # API route definitions
│       │   ├── services/    # Business logic (Azure, OAuth)
│       │   ├── validators/  # Request validation
│       │   └── webhooks/    # Clerk user sync
│       └── types/           # TypeScript definitions
│
├── packages/
│   ├── database/            # Prisma schema and client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── src/
│   │       └── generated/   # Prisma Client (custom output)
│   │
│   ├── widget/              # Embeddable widget library
│   │   ├── src/
│   │   │   ├── widget.ts    # Main entry point
│   │   │   ├── carousel.ts  # Carousel layout
│   │   │   ├── renderer.ts  # DOM rendering
│   │   │   └── styles.ts    # CSS-in-JS styles
│   │   └── vite.config.ts
│   │
│   ├── ui/                  # shadcn/ui components
│   │   └── src/components/
│   │
│   ├── types/               # Shared TypeScript types
│   ├── eslint-config/       # Shared ESLint configs
│   └── typescript-config/   # Shared tsconfig.json
│
└── turbo.json              # Turborepo pipeline config
```

### Data Flow

1. **Testimonial Submission**: Public form → Express API → PostgreSQL → Azure Blob (avatars)
2. **OAuth Verification**: Google Sign-In → Token verification → Database update
3. **Widget Rendering**: Script tag → Fetch public API → Render testimonials → Display verified badges
4. **Admin Management**: Next.js dashboard → TanStack Query → Express API → Database

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **pnpm**: 8.x or higher
- **PostgreSQL**: 14.x or higher
- **Azure Blob Storage**: Account with connection string
- **Clerk**: Account with publishable key and secret key
- **Google OAuth**: Client ID and secret (for verification)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/anubhabx/tresta.git
   cd tresta
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   **API (apps/api/.env)**

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/tresta"

   # Clerk
   CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   CLERK_WEBHOOK_SIGNING_SECRET="whsec_..."

   # Azure Blob Storage
   AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
   AZURE_STORAGE_CONTAINER_NAME="tresta-uploads"

   # Google OAuth
   GOOGLE_OAUTH_CLIENT_ID="your_client_id.apps.googleusercontent.com"
   GOOGLE_OAUTH_CLIENT_SECRET="your_client_secret"

   PORT=8000
   ```

   **Web (apps/web/.env.local)**

   ```bash
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."

   # API
   NEXT_PUBLIC_API_URL="http://localhost:8000"

   # Google OAuth
   NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID="your_client_id.apps.googleusercontent.com"
   ```

4. **Set up database**

   ```bash
   # Generate Prisma Client
   pnpm generate

   # Run migrations
   cd packages/database
   pnpm prisma migrate dev
   ```

5. **Start development servers**

   ```bash
   # Start all apps in parallel
   pnpm dev

   # Or start individually
   pnpm dev --filter web   # Next.js (http://localhost:3000)
   pnpm dev --filter api   # Express API (http://localhost:8000)
   ```

---

## 💻 Development

### Common Commands

```bash
# Development
pnpm dev                    # Run all apps
pnpm dev --filter web       # Run Next.js only
pnpm dev --filter api       # Run API only

# Database
pnpm generate               # Generate Prisma Client
cd packages/database && pnpm prisma migrate dev   # Create migration
cd packages/database && pnpm prisma studio        # Open Prisma Studio

# Widget
cd packages/widget && pnpm build    # Build widget library
cd packages/widget && pnpm demo     # Preview widget demos

# Building
pnpm build                  # Build all packages (respects dependency graph)
pnpm lint                   # Lint all packages
```

### Project-Specific Conventions

- **Import Paths**: Use workspace aliases (`@workspace/ui`, `@workspace/database`, etc.)
- **File Extensions**: Use `.ts` extension for TypeScript files (including imports)
- **Type Safety**: All API responses use standardized `ResponseHandler` class
- **Error Handling**: Custom error classes extending `ApiError` base
- **Query Keys**: Array format with entity type first (`["projects", "list", page]`)

### Adding UI Components

```bash
# Add shadcn/ui component to the workspace
pnpm dlx shadcn@latest add button -c apps/web
```

This places components in `packages/ui/src/components` and makes them available via:

```tsx
import { Button } from "@workspace/ui/components/button";
```

---

## 📦 Deployment

### Build for Production

```bash
# Build all packages
pnpm build

# Individual builds
pnpm build --filter web
pnpm build --filter api
pnpm build --filter widget
```

### Environment Setup

- **Frontend**: Deploy Next.js to Vercel/Netlify
- **Backend**: Deploy Express API to Railway/Render/Fly.io
- **Database**: PostgreSQL on Railway/Supabase/Neon
- **Storage**: Azure Blob Storage (production tier)
- **CDN**: Serve widget from CDN (Cloudflare/Fastly)

### Database Migrations

```bash
# Production migrations
cd packages/database
pnpm prisma migrate deploy
```

---

## 📚 Documentation

Comprehensive documentation is available in the repository:

### Project Documentation

- **[Project Status](PROJECT_STATUS.md)** - Detailed completion status and accomplishments (97% complete)
- **[Features](FEATURES.md)** - Complete feature implementation status and details
- **[Roadmap](ROADMAP.md)** - Development timeline and future plans
- **[Changelog](CHANGELOG.md)** - Version history and recent changes
- **[PRD](PRD.MD)** - Product Requirements Document

### Technical Documentation

- **[Feature Plan](FEATURE_PLAN.md)** - Planned enhancements and architecture improvements
- **[Widget API](WIDGET_API.md)** - Widget integration guide and API reference
- **[Testing Guide](TESTING_GUIDE.md)** - Testing strategies and guidelines
- **[Moderation UX](MODERATION_UX_IMPROVEMENTS.md)** - Auto-moderation implementation details
- **[Copilot Instructions](.github/copilot-instructions.md)** - Development patterns and conventions

### Quick Links

- 🚀 **[Getting Started](#getting-started)** - Setup and development
- 🎨 **[Widget Layouts](packages/widget/README.md)** - Widget customization
- 🔐 **[Authentication](apps/api/src/middleware/auth.middleware.ts)** - Auth implementation
- 📊 **[Database Schema](packages/database/prisma/schema.prisma)** - Data models

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Update documentation for new features
- Test changes locally before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Clerk](https://clerk.com/) - Authentication and user management
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Turborepo](https://turbo.build/) - High-performance build system

---

## 📧 Contact

**Anubhab Patnaik** - [@anubhabx](https://github.com/anubhabx)

Project Link: [https://github.com/anubhabx/tresta](https://github.com/anubhabx/tresta)

---

**Built with ❤️ using TypeScript and modern web technologies**
