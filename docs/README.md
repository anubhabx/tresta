# Tresta - Complete Technical Documentation

**Version:** 1.0  
**Last Updated:** November 27, 2025  
**Project Status:** 97% Complete - Production Ready

---

## 📚 Documentation Index

### Core Documentation

1. **[Technical Overview](./TECHNICAL_OVERVIEW.md)** - System architecture, tech stack, database schema
2. **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with examples
3. **[Notification System](./NOTIFICATION_SYSTEM.md)** - Real-time & email notifications architecture

### Project Documentation

4. **[README](../README.md)** - Project overview and getting started
5. **[PRD](../PRD.MD)** - Product Requirements Document
6. **[Project Status](../PROJECT_STATUS.md)** - Detailed completion status (97%)
7. **[Roadmap](../ROADMAP.md)** - Development timeline and future plans
8. **[Changelog](../CHANGELOG.md)** - Version history

### Feature-Specific Documentation

9. **[Phase 4 Summary](../apps/api/PHASE_4_SUMMARY.md)** - Email system implementation
10. **[Phase 4 Verification](../apps/api/PHASE_4_VERIFICATION.md)** - Testing checklist
11. **[Cron Jobs Testing](../apps/api/CRON_JOBS_TESTING.md)** - Testing guide for scheduled jobs
12. **[Testing Notifications](../TESTING_NOTIFICATIONS.md)** - Notification testing guide

---

## 🎯 Quick Start

### For Developers

```bash
# Clone repository
git clone https://github.com/anubhabx/tresta.git
cd tresta

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Run database migrations
cd packages/database
pnpm prisma migrate dev

# Start development servers
pnpm dev
```

### For API Integration

See [API Documentation](./API_DOCUMENTATION.md) for complete endpoint reference.

### For Widget Integration

```html
<!-- Add to your website -->
<div id="tresta-widget" data-widget-id="your_widget_id"></div>
<script src="https://cdn.tresta.app/widget.js"></script>
```

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │   Widget     │  │   Mobile     │     │
│  │   Web App    │  │   Embeds     │  │   (Future)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘     │
└─────────┼──────────────────┼──────────────────────────────┘
          │                  │
┌─────────▼──────────────────▼──────────────────────────────┐
│                     API Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Express    │  │   BullMQ     │  │    Ably      │    │
│  │   REST API   │  │   Workers    │  │  Real-time   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼──────────────────┼──────────────────┼───────────┘
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
│   └── api/                 # Express.js backend
├── packages/
│   ├── database/            # Prisma schema
│   ├── ui/                  # shadcn/ui components
│   ├── types/               # Shared types
│   ├── widget/              # Embeddable widget
│   └── config/              # Shared configs
└── docs/                    # Documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript 5.6** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **TanStack Query v5** - Server state
- **Zustand** - Client state
- **Clerk** - Authentication
- **Ably** - Real-time messaging

### Backend
- **Express.js 5** - Web framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **Redis** - Queue & caching
- **BullMQ** - Job queue
- **Resend** - Email service
- **Azure Blob** - File storage

### Infrastructure
- **Turborepo** - Monorepo orchestration
- **pnpm** - Package manager
- **Vercel** - Frontend hosting (planned)
- **Railway/Render** - Backend hosting (planned)

---

## 📊 Project Statistics

### Completion Status
- **Overall:** 97% Complete
- **Core Features:** 100% ✅
- **Notification System:** 100% ✅
- **Widget System:** 97% 🚧
- **Testing:** 0% ⚪
- **Documentation:** 45% 🚧

### Code Metrics
- **Total Lines:** ~26,700
- **Components:** 60+ React components
- **API Endpoints:** 25+ routes
- **Database Models:** 5 main models
- **Migrations:** 5 database migrations
- **Packages:** 5 workspace packages

---

## ✨ Key Features

### Implemented (97%)

#### Core Platform
- ✅ User authentication (Clerk OAuth)
- ✅ Project management (CRUD)
- ✅ Testimonial collection (public forms)
- ✅ Testimonial moderation (bulk actions)
- ✅ OAuth verification (Google Sign-In)
- ✅ Auto-moderation (sentiment analysis)
- ✅ Account settings (GDPR compliant)
- ✅ Dashboard with statistics

#### Notification System
- ✅ Real-time notifications (Ably)
- ✅ Email notifications (Resend)
- ✅ Daily digest (9 AM UTC)
- ✅ Quota management (200/day)
- ✅ Slack alerts (80%, 90%, 100%)
- ✅ Polling fallback
- ✅ Notification center UI
- ✅ User preferences

#### Widget System
- ✅ 5 layout types (Carousel, Grid, Masonry, Wall, List)
- ✅ Theme customization
- ✅ Verified badges
- ✅ Responsive design
- ✅ Zero dependencies
- ✅ CDN-ready
- ✅ WCAG 2.1 AA accessibility (keyboard nav, screen readers, reduced motion)
- ✅ CSP compliance tooling (runtime validator + audit script)
- ✅ Live preview (dashboard builder)
- ⏳ Production optimization (pending)

### Planned (5%)

#### Testing
- ⚪ Unit tests
- ⚪ Integration tests
- ⚪ E2E tests
- ⚪ Load testing

#### Polish
- ⚪ Email notifications for testimonials
- ⚪ Rate limiting
- ⚪ Security hardening
- ⚪ Performance optimization

#### Future Features
- ⚪ Analytics dashboard
- ⚪ Rich media support (video/audio)
- ⚪ Webhooks
- ⚪ Multi-language support
- ⚪ Team collaboration

---

## 🔐 Security

### Authentication
- Clerk JWT tokens for API
- OAuth providers (Google, GitHub)
- Token-based Ably authentication
- Webhook signature verification

### Authorization
- User-scoped data access
- Admin role for sensitive endpoints
- Public endpoints limited to PUBLIC projects

### Data Protection
- XSS prevention (DOMPurify)
- SQL injection prevention (Prisma)
- CORS configuration
- Rate limiting
- Input validation (Zod)

### Compliance
- GDPR data export
- Account deletion
- Privacy transparency page
- List-Unsubscribe headers

---

## 📈 Performance

### Targets
- **Page Load:** <2.5s (LCP)
- **API Response:** <200ms (p95)
- **Widget Load:** <1s
- **Uptime:** 99.9%+

### Optimizations
- Database indexing
- API response caching
- CDN for static assets
- Lazy loading
- Bundle optimization
- Image optimization

---

## 🧪 Testing

### Current Status
- ⚪ Unit tests: 0% coverage
- ⚪ Integration tests: Not started
- ⚪ E2E tests: Not started
- ✅ Manual testing: Comprehensive

### Testing Strategy
1. **Unit Tests** - Critical business logic
2. **Integration Tests** - API endpoints
3. **E2E Tests** - User flows
4. **Load Tests** - Performance validation

See [Testing Guide](../TESTING_NOTIFICATIONS.md) for details.

---

## 🚀 Deployment

### Environment Setup

**Development:**
```env
NODE_ENV=development
ENABLE_REAL_NOTIFICATIONS=false
ENABLE_REAL_EMAILS=false
```

**Production:**
```env
NODE_ENV=production
ENABLE_REAL_NOTIFICATIONS=true
ENABLE_REAL_EMAILS=true
ABLY_API_KEY=...
RESEND_API_KEY=...
REDIS_URL=...
DATABASE_URL=...
```

### Deployment Steps

1. **Database Migrations**
   ```bash
   cd packages/database
   pnpm prisma migrate deploy
   ```

2. **Build Applications**
   ```bash
   pnpm build
   ```

3. **Start Services**
   ```bash
   # Web (Vercel)
   vercel deploy --prod
   
   # API (Railway/Render)
   npm run start
   
   # Workers (separate dyno)
   npm run start:workers
   ```

4. **Verify Deployment**
   - Check `/healthz` endpoint
   - Check `/readyz` endpoint
   - Monitor logs
   - Test critical flows

---

## 📞 Support & Contact

### Documentation Issues
- Open an issue on GitHub
- Tag with `documentation` label

### Technical Questions
- Check existing documentation first
- Search closed issues
- Open new issue with details

### Feature Requests
- Open issue with `enhancement` label
- Describe use case and benefits
- Include mockups if applicable

---

## 🎯 Next Steps

### Immediate (This Week)
1. Complete widget optimization
2. Update documentation
3. Bug fixes and polish

### Short-term (Next 2 Weeks)
4. Testing implementation
5. Email notifications
6. Rate limiting & security

### Medium-term (Next Month)
7. Analytics dashboard
8. Rich media support
9. Launch preparation

See [Roadmap](../ROADMAP.md) for complete timeline.

---

## 📝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes
4. Write tests
5. Update documentation
6. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Meaningful commit messages
- Component documentation
- API documentation

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Clerk](https://clerk.com/) - Authentication
- [Prisma](https://www.prisma.io/) - ORM
- [Turborepo](https://turbo.build/) - Monorepo
- [Ably](https://ably.com/) - Real-time messaging
- [Resend](https://resend.com/) - Email service

---

**Built with ❤️ using TypeScript and modern web technologies**

