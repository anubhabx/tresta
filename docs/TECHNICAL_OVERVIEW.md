# Tresta - Comprehensive Technical Documentation

**Version:** 1.0  
**Last Updated:** November 11, 2025  
**Status:** Production Ready (95% Complete)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Frontend Architecture](#frontend-architecture)
7. [Notification System](#notification-system)
8. [Widget System](#widget-system)
9. [Security & Authentication](#security--authentication)
10. [Deployment & Infrastructure](#deployment--infrastructure)
11. [Development Guide](#development-guide)
12. [Testing Strategy](#testing-strategy)
13. [Performance Optimization](#performance-optimization)
14. [Future Roadmap](#future-roadmap)

---

## 🎯 Executive Summary

Tresta is a modern, full-stack testimonial management platform built with TypeScript, Next.js 15, and Express.js. The platform enables businesses to collect, moderate, and display customer testimonials through customizable embeddable widgets.

### Key Highlights

- **95% MVP Complete** - Production-ready core features
- **Monorepo Architecture** - Turborepo with 5 workspace packages
- **Type-Safe** - End-to-end TypeScript with strict mode
- **Modern Stack** - Next.js 15, React 19, Prisma ORM
- **Real-time Notifications** - Ably integration with polling fallback
- **Advanced Moderation** - AI-powered sentiment analysis and spam detection
- **OAuth Verification** - Google Sign-In for trusted testimonials
- **5 Widget Layouts** - Carousel, Grid, Masonry, Wall, List
- **GDPR Compliant** - Data export and account deletion

### Project Statistics

- **Total Lines of Code:** ~26,700
- **Components:** 60+ React components
- **API Endpoints:** 25+ routes
- **Database Models:** 5 main models
- **Migrations:** 5 database migrations
- **Packages:** 5 workspace packages

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │   Widget     │  │   Mobile     │     │
│  │   Web App    │  │   Embeds     │  │   (Future)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘     │
└─────────┼──────────────────┼──────────────────────────────┘
          │                  │
          │                  │
┌─────────▼──────────────────▼──────────────────────────────┐
│                     API Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Express    │  │   BullMQ     │  │    Ably      │    │
│  │   REST API   │  │   Workers    │  │  Real-time   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼──────────────────┼──────────────────┼───────────┘
          │                  │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼───────────┐
│                   Data & Services Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │    Redis     │  │    Azure     │    │
│  │   (Prisma)   │  │   (Queue)    │  │  Blob Store  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
tresta/
├── apps/
│   ├── web/                 # Next.js 15 frontend
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities & queries
│   │   ├── hooks/           # Custom hooks
│   │   └── store/           # Zustand stores
│   │
│   └── api/                 # Express.js backend
│       ├── src/
│       │   ├── controllers/ # Route handlers
│       │   ├── services/    # Business logic
│       │   ├── workers/     # BullMQ workers
│       │   ├── jobs/        # Cron jobs
│       │   ├── middleware/  # Auth, CORS, etc.
│       │   ├── routes/      # API routes
│       │   ├── templates/   # Email templates
│       │   └── utils/       # Helpers
│       └── types/           # TypeScript types
│
├── packages/
│   ├── database/            # Prisma schema
│   ├── ui/                  # shadcn/ui components
│   ├── types/               # Shared types
│   ├── widget/              # Embeddable widget
│   ├── eslint-config/       # ESLint configs
│   └── typescript-config/   # TypeScript configs
│
└── docs/                    # Documentation
```

---


## 🛠️ Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.x | React framework with App Router |
| **React** | 19.x | UI library |
| **TypeScript** | 5.6 | Type safety |
| **Tailwind CSS** | 3.x | Styling |
| **shadcn/ui** | Latest | UI components |
| **TanStack Query** | 5.x | Server state management |
| **Zustand** | 4.x | Client state management |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 3.x | Schema validation |
| **Clerk** | Latest | Authentication |
| **Ably** | 2.x | Real-time messaging |
| **Axios** | 1.x | HTTP client |
| **Sonner** | Latest | Toast notifications |
| **Lucide React** | Latest | Icons |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x+ | Runtime |
| **Express.js** | 5.x | Web framework |
| **TypeScript** | 5.6 | Type safety |
| **Prisma** | 5.x | ORM |
| **PostgreSQL** | 14.x+ | Database |
| **Redis** | 7.x | Queue & caching |
| **BullMQ** | 5.x | Job queue |
| **Resend** | 6.x | Email service |
| **Ably** | 2.x | Real-time (server) |
| **Azure Blob** | 12.x | File storage |
| **Clerk Express** | 1.x | Auth middleware |
| **Cron** | 4.x | Scheduled jobs |
| **IORedis** | 5.x | Redis client |
| **DOMPurify** | 3.x | XSS protection |

### Widget Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vanilla TypeScript** | 5.6 | Zero dependencies |
| **Vite** | 5.x | Build tool |
| **IIFE + ESM** | - | Distribution formats |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Turborepo** | Monorepo orchestration |
| **pnpm** | Package manager |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Vercel** | Frontend hosting (planned) |
| **Railway/Render** | Backend hosting (planned) |
| **Upstash** | Redis hosting |
| **Neon/Supabase** | PostgreSQL hosting (planned) |

---

## 🗄️ Database Schema

### Core Models

#### User Model
```prisma
model User {
  id                      String   @id @default(cuid())
  clerkId                 String   @unique
  email                   String   @unique
  name                    String?
  imageUrl                String?
  plan                    UserPlan @default(FREE)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  projects                Project[]
  notifications           Notification[]
  notificationPreferences NotificationPreferences?
  
  @@index([clerkId])
  @@index([email])
}

enum UserPlan {
  FREE
  PRO
}
```

#### Project Model
```prisma
model Project {
  id                      String            @id @default(cuid())
  userId                  String
  name                    String
  slug                    String            @unique
  description             String?
  type                    ProjectType       @default(OTHER)
  logoUrl                 String?
  brandColor              String?
  visibility              ProjectVisibility @default(PUBLIC)
  autoApprove             Boolean           @default(false)
  autoApproveVerified     Boolean           @default(false)
  moderationEnabled       Boolean           @default(true)
  moderationFilterLevel   String            @default("MODERATE")
  createdAt               DateTime          @default(now())
  updatedAt               DateTime          @updatedAt
  
  user                    User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  testimonials            Testimonial[]
  widgets                 Widget[]
  
  @@index([userId])
  @@index([slug])
}

enum ProjectType {
  SAAS_APP
  PORTFOLIO
  ECOMMERCE
  AGENCY
  COURSE
  COACHING
  CONSULTING
  FREELANCE
  PRODUCT
  SERVICE
  OTHER
}

enum ProjectVisibility {
  PUBLIC
  PRIVATE
  INVITE_ONLY
}
```

#### Testimonial Model
```prisma
model Testimonial {
  id                String             @id @default(cuid())
  projectId         String
  name              String
  email             String?
  rating            Int
  content           String
  type              TestimonialType    @default(TEXT)
  avatarUrl         String?
  isPublished       Boolean            @default(false)
  isOAuthVerified   Boolean            @default(false)
  oauthProvider     String?
  oauthSubject      String?
  moderationStatus  ModerationStatus   @default(PENDING)
  moderationFlags   Json?
  riskScore         Float?
  sentiment         String?
  detectedKeywords  Json?
  sourceIp          String?
  sourceUserAgent   String?
  sourceMetadata    Json?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  
  project           Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
  @@index([isPublished])
  @@index([moderationStatus])
  @@index([isOAuthVerified])
}

enum TestimonialType {
  TEXT
  VIDEO
  AUDIO
}

enum ModerationStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}
```

#### Widget Model
```prisma
model Widget {
  id                String   @id @default(cuid())
  projectId         String
  name              String
  type              String   // carousel, grid, masonry, wall, list
  config            Json     // Layout-specific configuration
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  project           Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
}
```

### Notification System Models

#### Notification Model
```prisma
model Notification {
  id          String           @id @default(cuid())
  userId      String
  type        NotificationType
  title       String
  message     String
  link        String?
  metadata    Json?
  isRead      Boolean          @default(false)
  createdAt   DateTime         @default(now())
  
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@index([createdAt])
}

enum NotificationType {
  NEW_TESTIMONIAL
  TESTIMONIAL_FLAGGED
  TESTIMONIAL_APPROVED
  TESTIMONIAL_REJECTED
  SECURITY_ALERT
}
```

#### NotificationPreferences Model
```prisma
model NotificationPreferences {
  id           String   @id @default(cuid())
  userId       String   @unique
  emailEnabled Boolean  @default(true)
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### EmailUsage Model
```prisma
model EmailUsage {
  id                String   @id @default(cuid())
  date              String   @unique  // YYYY-MM-DD
  count             Int      @default(0)
  lastSnapshotCount Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([date])
}
```

#### NotificationOutbox Model
```prisma
model NotificationOutbox {
  id             String   @id @default(cuid())
  notificationId String
  jobType        String
  payload        Json
  status         String   @default("pending")
  attempts       Int      @default(0)
  createdAt      DateTime @default(now())
  enqueuedAt     DateTime?
  
  @@index([status, createdAt])
  @@index([notificationId])
}
```

#### DeadLetterJob Model
```prisma
model DeadLetterJob {
  id               String   @id @default(cuid())
  jobId            String
  queue            String
  data             Json
  error            String
  errorType        String?
  statusCode       Int?
  providerResponse String?
  retryHistory     Json?
  failedAt         DateTime
  retried          Boolean  @default(false)
  retriedAt        DateTime?
  
  @@index([queue, failedAt])
  @@index([retried])
  @@index([errorType])
}
```

#### JobIdempotency Model
```prisma
model JobIdempotency {
  id          String    @id @default(cuid())
  jobKey      String    @unique
  jobId       String
  status      String
  createdAt   DateTime  @default(now())
  completedAt DateTime?
  
  @@index([jobKey, status])
  @@index([createdAt])
}
```

### Database Indexes

**Performance-critical indexes:**
- User: `clerkId`, `email`
- Project: `userId`, `slug`
- Testimonial: `projectId`, `isPublished`, `moderationStatus`, `isOAuthVerified`
- Notification: `userId + isRead`, `userId + createdAt`, `createdAt`
- NotificationOutbox: `status + createdAt`, `notificationId`
- DeadLetterJob: `queue + failedAt`, `retried`, `errorType`

---

