# Requirements Document - Notification & Email System (MVP)

## Introduction

This document outlines the MVP requirements for a lean, cost-effective notification and email system for Tresta. The focus is on shipping a polished, maintainable solution that works within free-tier constraints.

### Guiding Principle

**"Ship something maintainable that feels polished — not enterprise-grade for 200 users."**

### MVP Goals

✅ Inform users in-app (real-time via Ably)
✅ Email them only for critical updates
✅ Respect free-tier limits automatically
✅ Look branded and professional

### Service Constraints

**Resend:** 200 emails/day
**Ably:** 200 concurrent connections, 6M messages/month

### Design Philosophy

- **In-app first** - Most notifications via Ably
- **Critical emails only** - High-risk flags, security alerts
- **Daily digest** - One email per day for non-critical updates
- **Simple preferences** - Single toggle, not a matrix
- **Graceful fallback** - Polling if Ably fails

---

## Glossary

- **System**: The Tresta notification and email system
- **User**: A registered user of the Tresta platform
- **Notification**: An in-app message alerting users to events
- **Critical Event**: High-risk testimonial flag or security alert requiring immediate email
- **Digest**: Daily batched email summary of non-critical notifications
- **Ably**: Real-time messaging service for in-app notifications
- **Resend**: Transactional email service provider
- **BullMQ**: Queue system for async notification processing

---

## Requirements

### Requirement 1: In-App Notifications (Ably)

**User Story:** As a user, I want to receive real-time in-app notifications, so that I stay informed while using the application.

#### Acceptance Criteria

1. THE System SHALL use Ably for real-time notification delivery
2. THE System SHALL create one Ably channel per user for targeted delivery
3. WHEN a new testimonial is submitted, THE System SHALL send an in-app notification
4. WHEN a testimonial is flagged by auto-moderation, THE System SHALL send an in-app notification
5. THE System SHALL display unread notification count in the application header
6. THE System SHALL disconnect idle users after 30 minutes to conserve connections
7. THE System SHALL reconnect automatically when user returns to application

---

### Requirement 2: Notification Center

**User Story:** As a user, I want to view my notifications in one place, so that I can review and act on them.

#### Acceptance Criteria

1. THE System SHALL provide a notification center accessible from the header
2. THE System SHALL display notifications in reverse chronological order
3. THE System SHALL visually distinguish read from unread notifications
4. WHEN a user clicks a notification, THE System SHALL mark it as read and navigate to the relevant page
5. THE System SHALL allow users to mark all notifications as read
6. THE System SHALL display the last 30 days of notifications
7. THE System SHALL show a toast message when new notifications arrive

---

### Requirement 3: Critical Email Alerts

**User Story:** As a user, I want to receive immediate emails for critical events, so that I can respond quickly even when offline.

#### Acceptance Criteria

1. WHEN a testimonial is flagged as high-risk by auto-moderation, THE System SHALL send an immediate email
2. WHEN a security-related event occurs, THE System SHALL send an immediate email
3. THE System SHALL use Resend for email delivery
4. THE System SHALL include a direct action link in critical emails
5. THE System SHALL use a professional, branded HTML email template
6. THE System SHALL respect user email preferences before sending

---

### Requirement 4: Daily Digest Email

**User Story:** As a user, I want to receive a daily summary of non-critical notifications, so that I stay informed without email overload.

#### Acceptance Criteria

1. THE System SHALL send a daily digest email at 9 AM UTC
2. THE System SHALL include all non-critical notifications from the past 24 hours in the digest
3. THE System SHALL group similar notifications (e.g., "5 new testimonials") in the digest
4. WHEN no notifications exist for the day, THE System SHALL not send a digest email
5. THE System SHALL limit digest to 50 notifications maximum
6. THE System SHALL use the same branded template as critical emails

---

### Requirement 5: Notification Preferences

**User Story:** As a user, I want to control my email notifications, so that I only receive emails when I want them.

#### Acceptance Criteria

1. THE System SHALL provide a notification preferences page in user settings
2. THE System SHALL provide a single toggle: "Receive email notifications"
3. WHEN the toggle is disabled, THE System SHALL not send any emails to the user
4. WHEN the toggle is enabled, THE System SHALL send critical alerts and daily digest
5. THE System SHALL enable email notifications by default for new users
6. THE System SHALL save preference changes immediately

---

### Requirement 6: Notification Queue (BullMQ)

**User Story:** As a system, I want to queue notifications for reliable async delivery, so that the application remains responsive.

#### Acceptance Criteria

1. THE System SHALL use BullMQ with Redis for notification queueing
2. THE System SHALL queue all notifications for async processing
3. THE System SHALL process in-app notifications within 5 seconds
4. THE System SHALL process email notifications within 1 minute
5. THE System SHALL retry failed Ably publishes up to 2 times
6. THE System SHALL retry failed email sends up to 2 times
7. THE System SHALL log all notification processing attempts

---

### Requirement 7: Email Quota Management

**User Story:** As a system, I want to track email usage, so that I stay within the 200 emails/day limit.

#### Acceptance Criteria

1. THE System SHALL track daily email count in the database
2. THE System SHALL reset the email counter at midnight UTC
3. WHEN email count reaches 180 (90%), THE System SHALL log a warning
4. WHEN email count reaches 200, THE System SHALL defer non-critical emails to next day
5. THE System SHALL always send critical emails regardless of quota
6. THE System SHALL store deferred emails in the database for next-day delivery

---

### Requirement 8: Fallback Mechanism

**User Story:** As a user, I want to still receive notifications if real-time delivery fails, so that I don't miss important events.

#### Acceptance Criteria

1. WHEN Ably connection fails, THE System SHALL fall back to polling every 30 seconds
2. THE System SHALL automatically resume Ably connection when available
3. THE System SHALL log fallback activations for monitoring
4. WHEN polling is active, THE System SHALL display a connection status indicator
5. THE System SHALL fetch unread notifications via polling API endpoint

---

### Requirement 9: Email Templates

**User Story:** As a user, I want to receive professional, branded emails, so that they are easy to read and trustworthy.

#### Acceptance Criteria

1. THE System SHALL use a single responsive HTML email template
2. THE System SHALL include Tresta branding (logo, colors) in the template
3. THE System SHALL include clear call-to-action buttons in emails
4. THE System SHALL render properly on mobile and desktop email clients
5. THE System SHALL include an unsubscribe link in all emails

---

### Requirement 10: Security

**User Story:** As a user, I want my notifications to be secure and private, so that my information is protected.

#### Acceptance Criteria

1. THE System SHALL use token-based authentication for Ably connections
2. THE System SHALL only show notifications to the authenticated user who owns them
3. THE System SHALL sanitize notification content to prevent XSS attacks
4. THE System SHALL use secure HTTPS for all notification API endpoints
5. THE System SHALL expire notification action links after 7 days

---

### Requirement 11: Development Mode

**User Story:** As a developer, I want to test notifications without consuming quotas, so that I can develop efficiently.

#### Acceptance Criteria

1. WHEN NODE_ENV is "development" or "test", THE System SHALL use mock implementations
2. THE System SHALL log mock notifications to console instead of sending
3. THE System SHALL provide environment variable to enable/disable real services
4. THE System SHALL support Mailtrap for email testing in staging
5. THE System SHALL include unit tests with mocked Ably and Resend clients

---

## Notification Types (MVP)

1. **New Testimonial** - In-app + daily digest
2. **Testimonial Flagged (High-Risk)** - In-app + immediate email
3. **Testimonial Approved** - In-app + daily digest
4. **Testimonial Rejected** - In-app + daily digest
5. **Security Alert** - In-app + immediate email

---

## Non-Functional Requirements

### Performance
- In-app notification delivery < 5 seconds
- Email queue processing < 1 minute
- Notification center load time < 2 seconds

### Scalability (MVP)
- Support 200 concurrent users (Ably limit)
- Handle 200 emails/day (Resend limit)
- Stay within 6M Ably messages/month

### Reliability
- 99% in-app notification delivery
- Automatic retry for failures (2 attempts)
- Graceful fallback to polling

### Cost Optimization
- Default to daily digest (not immediate emails)
- Auto-disconnect idle Ably connections
- Simple rate limiting (10 emails/min hardcoded)
- Track quota in database

### Security
- Token-authenticated Ably connections
- XSS-safe notification rendering
- Secure API endpoints (HTTPS)
- 7-day link expiration

---

## Technical Stack

- **Real-time:** Ably (free tier)
- **Email:** Resend (free tier)
- **Queue:** BullMQ + Redis
- **Database:** PostgreSQL (Prisma)
- **Frontend:** Next.js + React
- **Backend:** Next.js API routes

---

## Database Schema

### Notifications Table
```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        String   // NEW_TESTIMONIAL, FLAGGED, etc.
  title       String
  message     String
  link        String?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId, isRead])
  @@index([createdAt])
}
```

### NotificationPreferences Table
```prisma
model NotificationPreferences {
  id                String   @id @default(cuid())
  userId            String   @unique
  emailEnabled      Boolean  @default(true)
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
}
```

### EmailUsage Table
```prisma
model EmailUsage {
  id          String   @id @default(cuid())
  date        DateTime @default(now())
  count       Int      @default(0)
  
  @@unique([date])
}
```

---

## Development Strategy

### Environment Configuration

```env
# Development
NODE_ENV=development
ENABLE_REAL_NOTIFICATIONS=false
ENABLE_REAL_EMAILS=false

# Staging
NODE_ENV=staging
ENABLE_REAL_NOTIFICATIONS=true
ENABLE_REAL_EMAILS=false
MAILTRAP_API_KEY=xxx

# Production
NODE_ENV=production
ENABLE_REAL_NOTIFICATIONS=true
ENABLE_REAL_EMAILS=true
ABLY_API_KEY=xxx
RESEND_API_KEY=xxx
```

### Mock Implementations

```typescript
// Conditional service switching
const notificationService = process.env.ENABLE_REAL_NOTIFICATIONS === 'true'
  ? new AblyNotificationService()
  : new MockNotificationService();

const emailService = process.env.ENABLE_REAL_EMAILS === 'true'
  ? new ResendEmailService()
  : new MockEmailService();
```

---

## Future Enhancements (Post-MVP)

### Phase 2 (After 500 users)
- Per-event notification preferences
- Weekly digest option
- Quota dashboard for admins
- Advanced notification grouping
- Notification search and filtering

### Phase 3 (Scale-up)
- Mobile push notifications
- Slack/Discord integration
- SMS notifications
- Self-hosted alternative (Novu)
- Multi-language support
- Custom notification rules

---

## Success Criteria

✅ Users receive real-time in-app notifications
✅ Critical events trigger immediate emails
✅ Daily digest keeps users informed without spam
✅ System stays within free-tier limits
✅ Professional, branded email templates
✅ Simple, intuitive user preferences
✅ Graceful fallback when services fail
✅ Zero quota usage during development

---

## MVP Scope Summary

**What's Included:**
- Real-time in-app notifications (Ably)
- Notification center with read/unread
- Critical email alerts (immediate)
- Daily digest email (9 AM UTC)
- Single preference toggle
- BullMQ queue for reliability
- Polling fallback
- Branded email template
- Basic quota tracking
- Development mocks

**What's Deferred:**
- Per-event preferences
- Weekly digests
- Admin quota dashboard
- Advanced grouping
- Notification search/filter
- Archive functionality
- Push notifications
- Third-party integrations

**Result:** ~⅓ the code, 80% of the user value, ships fast! 🚀
