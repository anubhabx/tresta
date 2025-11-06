# Tresta - Testimonial Management Platform

**A modern, full-stack platform for collecting, managing, and displaying customer testimonials with embeddable widgets.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-green)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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
- ✅ Manage and moderate testimonials with OAuth verification
- 🎨 Display testimonials on any website using embeddable widgets
- 📊 Track testimonial performance and analytics

Built as a **Turborepo monorepo** with modern TypeScript tooling, Tresta provides a seamless experience for both platform owners and end-users.

---

## ✨ Features

### Core Features (MVP - Completed)
- ✅ **OAuth Verification** - Google Sign-In for verified testimonials with trust badges
- ✅ **Avatar Support** - Auto-sync from OAuth providers, Azure Blob Storage integration
- ✅ **Embeddable Widgets** - Standalone JavaScript widgets (carousel, grid, masonry, wall, list)
- ✅ **Project Management** - Create and manage multiple testimonial projects
- ✅ **Testimonial Forms** - Public-facing forms with customizable branding
- ✅ **Admin Dashboard** - Full-featured management interface
- ✅ **Source Tracking** - IP address, user agent, and source metadata capture

### Widget Features
- 🎨 **5 Layout Types**: Carousel, Grid, Masonry, Wall, List
- 🎭 **Theme Customization**: Colors, fonts, border radius via data attributes
- 🔧 **Configurable Settings**: Ratings, dates, author info, autoplay
- 📦 **Zero Dependencies**: Pure vanilla JavaScript, CDN-ready
- ⚡ **Auto-initialization**: Detects and initializes from script tags
- 🎯 **Performance**: Optimized bundle (42.39 KB IIFE, 58.61 KB ESM)

### Authentication & Security
- 🔐 **Clerk Authentication** - Secure user management and OAuth
- 🛡️ **CORS Protection** - Configured for secure cross-origin requests
- 🔒 **JWT Tokens** - Bearer token authentication for API
- 🚫 **Rate Limiting** - Protection against abuse (planned)

### Coming Soon (In Development)
- 🤖 **Auto-Moderation** - AI-powered spam and content filtering
- 📊 **Analytics Dashboard** - Detailed source tracking and performance metrics
- 🎬 **Rich Media** - Video and audio testimonial support
- 🌐 **Multi-Language** - Internationalization support
- 🔗 **Webhooks** - Integration with external services

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
- **Language**: Vanilla TypeScript (no dependencies)
- **Build**: Vite (IIFE + ESM formats)
- **Distribution**: CDN-ready standalone library

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
   NEXT_PUBLIC_API_URL="http://localhost:8000/api"
   
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
import { Button } from "@workspace/ui/components/button"
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

- [Feature Plan](FEATURE_PLAN.md) - Planned features and architecture
- [Changelog](CHANGELOG.md) - Version history and updates
- [Widget API](WIDGET_API.md) - Widget integration guide
- [Testing Guide](TESTING_GUIDE.md) - Testing strategies
- [Roadmap](ROADMAP.md) - Future development plans

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
