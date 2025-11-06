# Feature Plan - Tresta Platform Enhancements

**Last Updated:** November 7, 2025  
**Status:** In Progress  
**Purpose:** Architectural improvements and new features to enhance testimonial management and widget capabilities

---

## 🚀 MVP Features (Launch Priority)

### ✅ Must Have (Pre-Launch)
1. ✅ **Verified Badge & Trust Indicators** - COMPLETED (Nov 5, 2025)
2. ✅ **Avatar Support** - COMPLETED (Nov 5, 2025)
3. ✅ **Auto-Moderation System** - COMPLETED (Nov 7, 2025)
4. **Source Tracking** - Analytics foundation (basic tracking implemented, analytics dashboard pending)

### 🟡 Nice to Have (MVP)
5. **Custom Fields & Metadata** - Flexibility for users
6. **Content Flagging (Heuristic)** - Basic quality control (COMPLETED as part of auto-moderation)

### 📅 Post-MVP (Future Phases)
7. **Rich Media Support** - Images/videos (routes implemented, UI later)
8. **Widget Analytics & Heatmaps** - Performance tracking
9. **Webhook System** - Integrations
10. **Multi-Language Support** - Internationalization
11. **Smart AI Selection** - Intelligent optimization
12. **Testimonial Responses** - Engagement feature

---

## 1. ✅ Verified Badge & Trust Indicators - COMPLETED

**Priority:** ⭐ MUST HAVE (MVP)  
**Status:** ✅ **COMPLETED** (November 5, 2025)  
**Effort:** 3-4 hours (Actual)  
**Impact:** Critical for credibility and trust

### Implementation Summary
Successfully implemented OAuth-based verification system with Google Sign-In integration for testimonial authors.

### Completed Features

#### ✅ Database Schema
```prisma
model Testimonial {
  // OAuth Verification fields added
  isOAuthVerified Boolean       @default(false)
  oauthProvider   String?       @db.VarChar(50)    // "google", "github"
  oauthSubject    String?       @db.VarChar(255)   // OAuth user ID
  authorAvatar    String?       @db.VarChar(1000)  // Avatar URL from Azure Blob
  // ...other fields
}
```

#### ✅ OAuth Integration
- **Google OAuth**: Integrated `@react-oauth/google` for frontend authentication
- **Token Verification**: Server-side verification using `google-auth-library`
- **Auto-fill Form**: Name, email, and avatar auto-populated from Google profile
- **Secure Storage**: OAuth subject ID stored for verification tracking

#### ✅ Verified Badge UI
- **Badge Display**: Green checkmark with `ShieldCheck` icon
- **Locations**: 
  - Testimonial cards in admin panel
  - Public testimonial submission page
  - All widget layouts (carousel, grid, masonry, wall, list)
- **Tooltip**: Shows verification method ("Verified via google")
- **Styling**: Green background (#d1fae5), 16px circular badge

#### ✅ Management Features
- **Verification Filter**: Dropdown to filter All/Verified/Unverified testimonials
- **Combined Filtering**: Works with status filters (pending/approved/published)
- **Badge Display**: Shows OAuth provider in admin interface
- **Index Optimization**: Database index on `isOAuthVerified` for performance

#### ✅ Widget Integration
- **Widget API**: OAuth verification fields included in public endpoint
- **All Layouts**: Verified badge support in carousel, grid, masonry, wall, list
- **Theme Integration**: Badge colors respect widget theme settings
- **Performance**: Optimized widget bundle (42.39 KB IIFE, 58.61 KB ESM)

#### ✅ Avatar Support
- **OAuth Avatars**: Auto-synced from Google profile
- **Azure Storage**: Avatars stored in Azure Blob Storage
- **Display**: Shown in testimonial cards and widgets
- **Fallback**: Graceful handling when avatar unavailable

### Environment Variables Required
```bash
# Frontend (Next.js)
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_client_id

# Backend (Express API)
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
```

### Files Modified
- `packages/database/prisma/schema.prisma` - OAuth fields
- `apps/api/src/lib/google-oauth.ts` - Token verification
- `apps/api/src/controllers/testimonial.controller.ts` - OAuth handling
- `apps/web/components/google-oauth-provider.tsx` - OAuth wrapper
- `apps/web/app/(public)/testimonials/[slug]/page.tsx` - Google Sign-In
- `apps/web/components/testimonial-card.tsx` - Verified badge
- `apps/web/components/testimonial-list.tsx` - Verification filter
- `packages/widget/src/*` - Widget badge support

### Migration
```bash
# Migration created and applied
20251105044214_add_oauth_verification
```

### Benefits Achieved
- ✅ Significantly increases trust and credibility
- ✅ Visual verification indicators improve conversion rates
- ✅ OAuth integration provides seamless user experience
- ✅ Avatar support makes testimonials more personal and authentic
- ✅ Filtering capabilities improve testimonial management
- ✅ Foundation for future OAuth providers (GitHub, LinkedIn, etc.)

### Future Enhancements (Post-MVP)
- GitHub OAuth verification
- LinkedIn OAuth verification
- Manual verification workflow for admins
- Trust score calculation based on multiple factors
- Bulk verification by email domain

---

## 2. 📊 Source Tracking - PARTIALLY IMPLEMENTED

**Priority:** ⭐ MUST HAVE (MVP)  
**Effort:** 2-3 hours  
**Impact:** Foundation for analytics and spam detection

### Description
Track where testimonials come from to analyze conversion rates, detect spam patterns, and provide insights to users.

### Database Schema Changes
```prisma
enum TestimonialSource {
  FORM_SUBMISSION = 'form_submission'
  EMAIL_IMPORT = 'email_import'
  CSV_IMPORT = 'csv_import'
  API_INTEGRATION = 'api_integration'
  WIDGET_SUBMISSION = 'widget_submission'
}

model Testimonial {
  source          TestimonialSource @default(FORM_SUBMISSION)
  sourceMetadata  Json?  // IP, user agent, referrer, utm params, etc.
}
```

### Features
- Automatic source detection based on submission method
- Store metadata: IP address, user agent, referrer, UTM parameters
- Analytics dashboard showing testimonial sources
- Filter/sort by source in admin panel
- Export data with source information

### Use Cases
- Track which marketing campaigns generate most testimonials
- Identify spam patterns by IP/user agent
- Understand customer journey (where they came from)
- Calculate ROI on different testimonial collection methods

### Benefits
- ✅ Data-driven decision making
- ✅ Spam detection and prevention
- ✅ Marketing attribution
- ✅ Customer insights

---

## 3. ✅ Auto-Moderation System - COMPLETED

**Priority:** ⭐ MUST HAVE (MVP)  
**Status:** ✅ **COMPLETED** (November 7, 2025)  
**Effort:** 6-8 hours (Actual)  
**Impact:** Critical for reducing manual workload and preventing spam

### Implementation Summary
Successfully implemented a comprehensive auto-moderation system with advanced sentiment analysis, profanity detection, and spam filtering.

### Completed Features

#### ✅ Database Schema
```prisma
enum ModerationStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

model Testimonial {
  moderationStatus  ModerationStatus @default(PENDING)
  moderationScore   Float?           // 0-1, higher = more problematic
  moderationFlags   Json?            // Array of detected issues
  autoPublished     Boolean @default(false)
}

model Project {
  autoModeration       Boolean @default(true)
  autoApproveVerified  Boolean @default(false)
  profanityFilterLevel String? @default("MODERATE")
  moderationSettings   Json?   // Custom moderation rules
}
```

#### ✅ Advanced Sentiment Analysis
- **Weighted Keyword Categories:**
  - NEGATIVE_KEYWORDS_SEVERE (weight: 0.4): scam, fraud, illegal, lawsuit
  - NEGATIVE_KEYWORDS_STRONG (weight: 0.25): terrible, horrible, worst, hate
  - NEGATIVE_KEYWORDS_MODERATE (weight: 0.15): bad, disappointing, poor, slow
  - POSITIVE_KEYWORDS (weight: 0.2): excellent, amazing, fantastic, great
- **Sentiment Scoring:** -1 (very negative) to +1 (very positive)
- **Five Categories:** very_negative, negative, neutral, positive, very_positive
- **Transparency:** Returns detected keywords with reasons

#### ✅ Profanity Detection
- **Multi-category Lists:** Severe, mild, and offensive profanity
- **Pattern Matching:** Case-insensitive with word boundaries
- **Configurable Levels:** STRICT, MODERATE, LENIENT

#### ✅ Spam Detection
- **Excessive Caps:** Detects >50% uppercase text
- **Repeated Characters:** Finds 3+ consecutive identical characters
- **URL Detection:** Flags URLs in content

#### ✅ Risk Scoring System
- **0-1 Scale:** Higher score = more problematic
- **Weighted Components:**
  - Profanity: 0.5 per severe word, 0.3 per mild word
  - Spam: 0.4 for caps, 0.3 for repetition, 0.2 for URLs
  - Negative Sentiment: 0.2-0.5 based on sentiment score
- **Auto-Actions:**
  - Score >= 0.7 → REJECTED
  - Score >= 0.4 → FLAGGED for manual review
  - Score < 0.4 → APPROVED (if no other issues)

#### ✅ Moderation Service
**File:** `apps/api/src/services/moderation.service.ts` (450+ lines)
- `moderateTestimonial()` - Main moderation function
- `analyzeSentiment()` - Sentiment analysis
- `checkProfanity()` - Profanity detection
- `checkForSpam()` - Spam pattern detection
- `calculateRiskScore()` - Risk scoring algorithm
- `generateModerationFlags()` - Flag generation with reasons

#### ✅ Integrated UI
**Testimonial List** (`apps/web/components/testimonial-list.tsx`):
- Moderation status filter dropdown
- Select All checkbox for bulk operations
- Individual checkboxes per testimonial
- Fixed bottom action bar (Approve/Flag/Reject buttons)
- Moderation stats badges in header
- No layout shift with fixed positioning

**Testimonial Cards** (`apps/web/components/testimonial-card.tsx`):
- Color-coded moderation badges:
  - Green Shield icon for APPROVED
  - Red AlertTriangle icon for FLAGGED
  - Red XCircle icon for REJECTED
- Detailed tooltips showing:
  - Risk score (0.00-1.00 format)
  - List of moderation flags
  - Truncated display (first 3 flags + count)

#### ✅ Migration Tools
**Script:** `apps/api/src/scripts/migrate-existing-testimonials.ts`
- Batch processes existing PENDING testimonials (50 at a time)
- Respects project-level `autoModeration` setting
- Outputs detailed statistics (approved/flagged/rejected counts)
- Run via: `pnpm migrate:testimonials`

**Example Output:**
```
🔍 Starting migration of existing testimonials...
📊 Found 127 testimonials to moderate
✅ Processed abc123: APPROVED (score: 0.23)
⚠️  Processed def456: FLAGGED (score: 0.67)
📦 Batch 1 complete
...
🎉 Migration complete!
📊 Results:
    - Processed: 127
    - Approved: 89
    - Flagged: 31
    - Rejected: 7
```

### Files Created/Modified
- ✅ `apps/api/src/services/moderation.service.ts` - NEW (450+ lines)
- ✅ `apps/api/src/scripts/migrate-existing-testimonials.ts` - NEW
- ✅ `apps/api/src/controllers/testimonial.controller.ts` - MODIFIED
- ✅ `apps/web/components/testimonial-list.tsx` - MODIFIED
- ✅ `apps/web/components/testimonial-card.tsx` - MODIFIED
- ✅ `packages/database/prisma/schema.prisma` - MODIFIED
- ✅ Migration: `20251106144930_add_auto_moderation/`
- ✅ `apps/api/package.json` - Added `migrate:testimonials` script

### Benefits Achieved
- ✅ Dramatically reduces manual moderation workload
- ✅ Prevents spam and abusive content from reaching queue
- ✅ Maintains high content quality automatically
- ✅ Protects brand reputation with risk scoring
- ✅ Transparent moderation with detailed flags
- ✅ Configurable per-project settings
- ✅ Seamless UI integration with bulk actions

### Future Enhancements (Post-MVP)
- AI moderation integration (OpenAI Moderation API, Perspective API)
- Custom ML model trained on project-specific data
- Email domain whitelist/blacklist
- Advanced duplicate detection
- Moderation analytics dashboard

---

## 4. 🎨 Custom Fields & Metadata

**Priority:** 🟡 NICE TO HAVE (MVP)  
**Effort:** 4-5 hours  
**Impact:** Flexibility for different use cases, user customization

### Description
Allow users to define custom fields for testimonials to collect structured data specific to their business needs.

### Database Schema Changes
```prisma
model Project {
  // ...existing fields...
  customFields  Json?  // Array of field definitions
}

model Testimonial {
  // ...existing fields...
  customData    Json?  // Key-value pairs matching customFields
}
```

### Custom Field Types
- **Text:** Free-form text input
- **Select:** Dropdown with predefined options
- **Multi-Select:** Multiple choices
- **Number:** Numeric input
- **Date:** Date picker
- **URL:** Link validation
- **Boolean:** Yes/No checkbox

### Example Configuration
```json
{
  "customFields": [
    {
      "key": "product",
      "label": "Product Used",
      "type": "select",
      "options": ["Basic", "Pro", "Enterprise"],
      "required": false
    },
    {
      "key": "useCase",
      "label": "Use Case",
      "type": "text",
      "required": false
    },
    {
      "key": "industry",
      "label": "Industry",
      "type": "select",
      "options": ["SaaS", "E-commerce", "Healthcare", "Education"],
      "required": false
    }
  ]
}
```

### Features (MVP Scope)
- Define custom fields in project settings
- Render custom fields in testimonial form
- Basic validation (required, type checking)
- Display in admin testimonial list
- Export custom field data

### Widget Integration
- Display custom badges: "Enterprise Customer", "Healthcare"
- Filter by custom field (future enhancement)

### Benefits
- ✅ Highly customizable for any business
- ✅ Better segmentation and filtering
- ✅ Collect structured data
- ✅ Competitive advantage

---

## 5. 📸 Rich Media Support (Backend Routes Only)

**Priority:** 🔵 POST-MVP (Routes Implemented, UI Later)  
**Effort:** 3 hours (backend only)  
**Impact:** Foundation for future media features

### Description
**MVP Scope:** Implement backend API routes and database schema for media support. UI and actual media handling will be added post-MVP when video/image testimonials become a priority.

### Database Schema Changes
```prisma
enum MediaType {
  IMAGE
  VIDEO
  AUDIO
}

model TestimonialMedia {
  id            String   @id @default(cuid())
  testimonialId String
  testimonial   Testimonial @relation(fields: [testimonialId], references: [id], onDelete: Cascade)
  type          MediaType
  url           String
  thumbnailUrl  String?
  metadata      Json?  // dimensions, duration, file size, format
  createdAt     DateTime @default(now())
  
  @@index([testimonialId])
}
```

### MVP Implementation
- **Database migration only** - Set up schema
- **API routes** - CRUD endpoints for media (not actively used yet)
  - `POST /api/testimonials/:id/media` - Upload media
  - `GET /api/testimonials/:id/media` - List media
  - `DELETE /api/media/:id` - Delete media
- **No UI** - No upload forms or display components
- **No storage integration** - Will use Azure Blob when needed

### Future Enhancements (Post-MVP)
- Upload UI in dashboard
- Widget media display
- Image optimization
- Video embed support
- Storage integration

### Benefits
- ✅ Infrastructure ready for future features
- ✅ No development time wasted later
- ✅ API versioning maintained
- ✅ Minimal effort for MVP

---

## 6. 📈 Widget Analytics & Heatmaps

**Priority:** 🔵 POST-MVP  
**Effort:** 8-10 hours  
**Impact:** Helps users prove ROI and optimize widgets

### Description
Track widget performance with detailed analytics: impressions, clicks, engagement, and visual heatmaps.

### Database Schema Changes
```prisma
model WidgetAnalytics {
  id          String   @id @default(cuid())
  widgetId    String
  widget      Widget   @relation(fields: [widgetId], references: [id], onDelete: Cascade)
  
  // Metrics
  impressions Int      @default(0)
  clicks      Int      @default(0)
  clickRate   Float    @default(0)
  
  // Engagement
  carouselNavigations Int @default(0)
  testimonialExpands  Int @default(0)
  
  // Date tracking
  date        DateTime @default(now())
  
  @@unique([widgetId, date])
  @@index([widgetId, date])
}

model WidgetEvent {
  id          String   @id @default(cuid())
  widgetId    String
  eventType   WidgetEventType
  testimonialId String?
  metadata    Json?    // User agent, referrer, coordinates (for heatmap)
  createdAt   DateTime @default(now())
  
  @@index([widgetId, eventType, createdAt])
}

enum WidgetEventType {
  IMPRESSION
  CLICK
  CAROUSEL_NEXT
  CAROUSEL_PREV
  TESTIMONIAL_EXPAND
  LINK_CLICK
}
```

### Tracking Features
- Page impressions (when widget loads)
- Click tracking (when user interacts)
- Carousel navigation tracking
- Individual testimonial engagement
- Time on page before interaction
- Scroll depth when impression occurs

### Analytics Dashboard
- Real-time visitor count
- Impressions/clicks over time (line charts)
- Click-through rate (CTR) by widget
- Most popular testimonials (by clicks)
- Engagement rate by layout type
- Geographic distribution of viewers
- Device breakdown (mobile vs desktop)
- Referrer analysis (where traffic comes from)

### Heatmap Features
- Visual heatmap showing where users click
- Scroll depth visualization
- Testimonial popularity overlay
- A/B test different widget configurations
- Export analytics reports (CSV, PDF)

### Widget SDK Updates
```javascript
// Analytics event tracking
TrestaWidget.init(widgetId, {
  analytics: true,  // Enable analytics tracking
  trackClicks: true,
  trackImpressions: true,
  trackScrollDepth: true
});
```

### Benefits
- ✅ Prove ROI to customers
- ✅ Optimize widget performance
- ✅ Understand user behavior
- ✅ Data-driven improvements

---

## 7. 🔗 Webhook System

**Priority:** 🔵 POST-MVP  
**Effort:** 4-5 hours  
**Impact:** Enables integrations with other platforms

### Description
Allow users to configure webhooks that trigger on testimonial events, enabling integrations with Slack, CRMs, email tools, etc.

### Database Schema Changes
```prisma
model Webhook {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  name        String
  url         String
  events      WebhookEvent[]
  secret      String   // For signature verification
  active      Boolean  @default(true)
  
  lastTriggered DateTime?
  lastStatus    Int?  // HTTP status code
  failureCount  Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([projectId])
}

enum WebhookEvent {
  TESTIMONIAL_CREATED
  TESTIMONIAL_PUBLISHED
  TESTIMONIAL_UPDATED
  TESTIMONIAL_DELETED
  TESTIMONIAL_APPROVED
  TESTIMONIAL_REJECTED
}
```

### Features
- Configure multiple webhooks per project
- Select which events trigger each webhook
- HMAC signature for security
- Automatic retry on failure (3 attempts)
- Webhook delivery logs
- Test webhook functionality
- Disable webhook after multiple failures

### Webhook Payload
```json
{
  "event": "testimonial.published",
  "timestamp": "2025-11-04T10:30:00Z",
  "projectId": "cm3abc123",
  "data": {
    "testimonial": {
      "id": "cm3xyz789",
      "content": "Amazing product!",
      "rating": 5,
      "author": {
        "name": "John Doe",
        "email": "john@example.com",
        "verified": true
      }
    }
  }
}
```

### Integration Examples
- **Slack:** Post new testimonials to channel
- **HubSpot/Salesforce:** Create contact with testimonial
- **Mailchimp:** Add to email list, trigger campaign
- **Zapier:** Connect to 3000+ apps
- **Discord:** Notification bot
- **Google Sheets:** Log testimonials

### Admin UI
- Webhook management page
- Add/edit/delete webhooks
- Test webhook with sample payload
- View delivery logs
- Retry failed deliveries
- Generate webhook secret

### Benefits
- ✅ Enables powerful integrations
- ✅ Automates workflows
- ✅ Enterprise-ready feature
- ✅ Increases platform value

---

## 8. 🎨 Custom Fields & Metadata

**Priority:** MEDIUM  
**Effort:** 5-6 hours  
**Impact:** Flexibility for different use cases

### Description
Allow users to define custom fields for testimonials to collect structured data specific to their business.

### Database Schema Changes
```prisma
model Project {
  // ...existing fields...
  customFields  Json?  // Array of field definitions
}

model Testimonial {
  // ...existing fields...
  customData    Json?  // Key-value pairs matching customFields
}
```

### Custom Field Types
- **Text:** Free-form text input
- **Select:** Dropdown with predefined options
- **Multi-Select:** Multiple choices
- **Number:** Numeric input
- **Date:** Date picker
- **URL:** Link validation
- **Boolean:** Yes/No checkbox

### Example Configuration
```json
{
  "customFields": [
    {
      "key": "product",
      "label": "Product Used",
      "type": "select",
      "options": ["Basic", "Pro", "Enterprise"],
      "required": false
    },
    {
      "key": "useCase",
      "label": "Use Case",
      "type": "text",
      "required": false
    },
    {
      "key": "industry",
      "label": "Industry",
      "type": "select",
      "options": ["SaaS", "E-commerce", "Healthcare", "Education"],
      "required": false
    },
    {
      "key": "teamSize",
      "label": "Team Size",
      "type": "select",
      "options": ["1-10", "11-50", "51-200", "200+"],
      "required": false
    }
  ]
}
```

### Features
- Define custom fields in project settings
- Render custom fields in testimonial form
- Validate custom field data
- Filter testimonials by custom field values
- Display custom fields in widget (optional)
- Export custom field data
- Search testimonials by custom data

### Widget Integration
- Filter testimonials by custom field: `data-filter-product="Pro"`
- Display custom badges: "Enterprise Customer", "Healthcare Industry"
- Group testimonials by custom field
- Show custom field in testimonial card

### Use Cases
- **SaaS:** Filter by plan tier, use case, company size
- **E-commerce:** Filter by product category, purchase amount
- **Agency:** Filter by service type, project size
- **Education:** Filter by course, student level

### Benefits
- ✅ Highly customizable
- ✅ Fits any business model
- ✅ Better segmentation
- ✅ Richer analytics

---

## 8. 🌍 Multi-Language Support

**Priority:** 🔵 POST-MVP  
**Effort:** 6-8 hours  
**Impact:** International expansion, broader audience

### Description
Serve testimonials in multiple languages with automatic or manual translation.

### Database Schema Changes
```prisma
enum TranslationMethod {
  MANUAL
  AUTO_DEEPL
  AUTO_GOOGLE
}

model TestimonialTranslation {
  id            String   @id @default(cuid())
  testimonialId String
  testimonial   Testimonial @relation(fields: [testimonialId], references: [id], onDelete: Cascade)
  
  language      String   // ISO 639-1 code (en, es, fr, de, etc.)
  content       String
  translatedBy  TranslationMethod
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([testimonialId, language])
  @@index([testimonialId])
}
```

### Features
- Auto-detect user language from browser
- Manual translation interface for admins
- Automatic translation via DeepL/Google Translate API
- Language selector dropdown in widget
- Fallback to original if translation unavailable
- Translation quality indicator
- Bulk translate multiple testimonials

### Widget Implementation
```javascript
TrestaWidget.init(widgetId, {
  language: 'auto',  // Auto-detect from browser
  // OR
  language: 'es',    // Force specific language
  fallbackLanguage: 'en',
  showLanguageSelector: true
});
```

### Supported Languages (Initial)
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Italian (it)
- Japanese (ja)
- Chinese Simplified (zh-CN)

### Admin Features
- Translation management page
- Add/edit translations manually
- Auto-translate button (bulk or single)
- View translation coverage (% translated per language)
- Translation quality review

### Benefits
- ✅ Reach international customers
- ✅ Improve global conversion rates
- ✅ Better user experience for non-English speakers
- ✅ Competitive advantage

---

## 9. 🤖 Smart Testimonial Selection (AI)

**Priority:** 🔵 POST-MVP  
**Effort:** 10-12 hours  
**Impact:** Advanced optimization, higher conversion

### Description
AI-powered system to intelligently select and display testimonials based on user context, page content, and engagement patterns.

### Database Schema Changes
```prisma
enum SelectionStrategy {
  RECENT          // Show most recent
  HIGHEST_RATED   // Show 5-star first
  RANDOM          // Random selection
  ROTATING        // Cycle through all
  SMART_AI        // AI-based relevance
}

model Widget {
  // ...existing fields...
  selectionStrategy SelectionStrategy @default(RECENT)
  selectionRules    Json?  // Custom rules for filtering
}

model TestimonialEngagement {
  id            String   @id @default(cuid())
  testimonialId String
  testimonial   Testimonial @relation(fields: [testimonialId], references: [id], onDelete: Cascade)
  
  impressions   Int      @default(0)
  clicks        Int      @default(0)
  ctr           Float    @default(0)
  conversions   Int      @default(0)  // If tracking enabled
  
  updatedAt     DateTime @updatedAt
  
  @@unique([testimonialId])
}
```

### AI Features
- **Context Matching:** Analyze page URL, meta tags, content to show relevant testimonials
- **Sentiment Analysis:** Detect sentiment and show appropriate testimonials
- **Engagement Optimization:** Prioritize testimonials with higher engagement rates
- **A/B Testing:** Automatically test which testimonials convert best
- **Personalization:** Show different testimonials based on user behavior

### Selection Strategies

**Smart AI Algorithm:**
```
Score = (Relevance × 0.4) + (Engagement × 0.3) + (Recency × 0.2) + (Rating × 0.1)

Relevance: Keyword matching between page content and testimonial
Engagement: CTR and time spent viewing
Recency: How recent the testimonial is
Rating: Star rating (5-star weighted higher)
```

### Custom Rules Example
```json
{
  "rules": [
    {
      "if": "url contains '/pricing'",
      "then": "show testimonials with 'affordable' or 'value'"
    },
    {
      "if": "url contains '/enterprise'",
      "then": "show testimonials from enterprise customers"
    }
  ]
}
```

### Features
- ML model training on engagement data
- Real-time testimonial ranking
- Continuous optimization (learning loop)
- A/B test results dashboard
- Performance comparison by strategy

### Benefits
- ✅ Higher conversion rates
- ✅ Better user experience
- ✅ Automatic optimization
- ✅ Data-driven testimonial selection

---

## 10. 🏆 Social Proof Indicators

**Priority:** 🟡 NICE TO HAVE (MVP - if time allows)  
**Effort:** 2-3 hours  
**Impact:** Boosts credibility with aggregate stats

### Description
Display aggregate statistics and social proof elements to increase trust and credibility.

### Database Schema Changes
```prisma
model Project {
  // ...existing fields...
  stats         Json?  // Cached aggregates (updated daily)
}
```

### Example Stats
```json
{
  "totalTestimonials": 1247,
  "averageRating": 4.8,
  "totalCustomers": 10000,
  "countriesRepresented": 45,
  "topIndustries": ["SaaS", "E-commerce", "Healthcare"],
  "verifiedCustomers": 892,
  "lastUpdated": "2025-11-04T10:00:00Z"
}
```

### Widget Display Options
- **Banner:** "Join 10,000+ happy customers"
- **Rating Summary:** "4.8/5 from 1,247 reviews"
- **Company Logo Wall:** Display verified company logos
- **Interactive Map:** Show customer locations
- **Industry Badge:** "Trusted by 500+ SaaS companies"
- **Live Counter:** Real-time testimonial count animation

### Widget Configuration
```javascript
TrestaWidget.init(widgetId, {
  showStats: true,
  statsPosition: 'top',  // 'top', 'bottom', 'sidebar'
  statsDisplay: [
    'totalTestimonials',
    'averageRating',
    'verifiedCustomers'
  ]
});
```

### Features
- Auto-calculate stats from testimonials
- Cache stats for performance (daily cron job)
- Configurable stat displays
- Animated counters
- Social share count integration

### Benefits
- ✅ Increases trust dramatically
- ✅ Shows scale and popularity
- ✅ Validates product/service quality
- ✅ Converts more visitors

---

## 11. 💬 Testimonial Response Feature

**Priority:** 🔵 POST-MVP  
**Effort:** 3-4 hours  
**Impact:** Increases engagement and shows responsiveness

### Description
Allow project owners to respond to testimonials, similar to Google Reviews. Shows that the business cares about customer feedback.

### Database Schema Changes
```prisma
model TestimonialResponse {
  id            String   @id @default(cuid())
  testimonialId String
  testimonial   Testimonial @relation(fields: [testimonialId], references: [id], onDelete: Cascade)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  content       String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([testimonialId])
}
```

### Features
- Add response directly from testimonial detail page
- Edit/delete responses
- Notification to customer when response added (optional)
- Show response count in testimonial list
- Filter testimonials with/without responses

### Widget Display
- Show response below testimonial
- Different styling (indented, different background)
- "Response from [Company Name]" header
- Timestamp of response
- Configurable via `settings.showResponses` (default: true)

### Use Cases
- Thank customers for positive feedback
- Address concerns in neutral/negative reviews
- Show prospects that you're responsive
- Build relationships with customers

### Benefits
- ✅ Demonstrates customer care
- ✅ Turns negative reviews into positive interactions
- ✅ Increases engagement
- ✅ Provides context to prospects

---

## 📅 Implementation Roadmap

### 🚀 MVP Phase - Week 1-2 (Must Have)
**Goal: Launch-ready platform with core trust & moderation features**

1. ⭐ **Verified Badge & Trust Indicators** (3-4 hours)
   - Database migration (User.emailVerified, User.verified, Testimonial.authorVerified, authorAvatar)
   - Avatar upload and storage
   - Verification logic (email matching, manual verify)
   - Trust score calculation
   - Widget verified badge rendering
   - Admin verification UI
   - Gravatar/initials fallback

2. ⭐ **Source Tracking** (2-3 hours)
   - Add source enum and metadata field
   - Capture source on testimonial creation
   - Store IP, user agent, referrer, UTM params
   - Basic source display in admin

3. ⭐ **Auto-Moderation System** (4-6 hours)
   - Moderation status and score fields
   - Heuristic rules engine (profanity, spam, quality checks)
   - Moderation queue in dashboard
   - Bulk approve/reject actions
   - Configurable moderation settings per project
   - Email domain whitelist/blacklist

4. 🟡 **Custom Fields & Metadata** (4-5 hours)
   - Custom field configuration in project settings
   - Field type support (text, select, number, date, boolean)
   - Render fields in testimonial form
   - Basic validation
   - Display in admin list
   - Export functionality

5. 🔵 **Rich Media Routes** (2-3 hours)
   - Database schema for TestimonialMedia
   - API routes (POST/GET/DELETE)
   - No UI implementation
   - Documentation for future use

**Total MVP Time: ~15-21 hours**

---

### 🎯 Post-MVP Phase 1 - Month 1 (Analytics & Engagement)

6. 📈 **Widget Analytics & Heatmaps** (8-10 hours)
   - Event tracking system
   - Analytics dashboard
   - Heatmap visualization
   - Performance metrics
   - Export reports

7. 💬 **Testimonial Responses** (3-4 hours)
   - Response database model
   - Response UI in dashboard
   - Widget display
   - Notifications

**Total Phase 1 Time: ~11-14 hours**

---

### 🌟 Post-MVP Phase 2 - Month 2-3 (Integrations & Intelligence)

8. 🔗 **Webhook System** (4-5 hours)
   - Webhook configuration
   - Event triggers
   - Delivery system
   - Admin UI

9. 🌍 **Multi-Language Support** (6-8 hours)
   - Translation system
   - Auto-translate API integration
   - Language selector
   - Admin translation UI

10. 🤖 **Smart AI Selection** (10-12 hours)
    - ML model development
    - Relevance scoring
    - A/B testing framework
    - Optimization dashboard

**Total Phase 2 Time: ~20-25 hours**

---

### 🔮 Future Enhancements (Month 4+)

- Rich media UI and full implementation
- Video testimonial recording
- AI content generation from testimonials
- Advanced analytics (sentiment trends, competitor comparison)
- White-label solution
- Mobile SDKs
- Browser extensions

---

## 🎯 Success Metrics

### MVP Launch Criteria

**Must Have:**
- ✅ Verified badges working on testimonials
- ✅ Avatar support implemented
- ✅ Auto-moderation catching >80% of spam
- ✅ Source tracking capturing all submissions
- ✅ Custom fields functional and configurable

**Quality Gates:**
- ✅ <2% false positive rate on auto-moderation
- ✅ Verified badge displays correctly in all 5 widget layouts
- ✅ Avatar fallback (initials) works without errors
- ✅ Custom fields validated properly
- ✅ No breaking changes to existing widgets

### Feature-Specific Metrics

**Verified Badge:**
- % of testimonials verified (target: >30%)
- User trust score increase (survey-based)
- Conversion rate impact (A/B test)

**Auto-Moderation:**
- % spam caught automatically (target: >80%)
- Time saved on manual moderation (hours/week)
- False positive rate (target: <2%)
- False negative rate (target: <5%)

**Custom Fields:**
- % of projects using custom fields (target: >40%)
- Average fields per project
- User satisfaction score

**Avatar Support:**
- % of testimonials with avatars (target: >50%)
- Engagement increase with avatars vs without

---

## 💡 Additional Ideas (Future Consideration)

### Quick Wins
- **Email Collection Widget:** Capture emails with testimonial submission
- **QR Code Generator:** Generate QR codes for widget links
- **Print-Friendly Export:** Export testimonials for brochures/presentations
- **Testimonial Scheduling:** Schedule when testimonials appear/disappear

### Advanced Features
- **Video Testimonial Recording:** In-browser video recording
- **AI Content Generation:** Generate marketing copy from testimonials
- **Sentiment Trend Analysis:** Track sentiment over time
- **Competitor Comparison:** Compare your testimonials to competitors
- **White-Label Solution:** Allow users to fully brand the platform

### Integrations
- **Shopify Plugin:** Native Shopify app
- **WordPress Plugin:** WordPress integration
- **Chrome Extension:** Collect testimonials while browsing
- **Mobile SDK:** iOS/Android native widgets

---

## 📝 Notes & Decisions

### MVP Scope Decisions

✅ **Included in MVP:**
- Verified badges & trust indicators (critical for credibility)
- Avatar support (visual identity, better UX)
- Auto-moderation with heuristics (spam prevention)
- Source tracking (analytics foundation)
- Custom fields (flexibility for users)
- Rich media backend routes (future-proofing, minimal effort)

❌ **Excluded from MVP (Post-Launch):**
- Rich media UI/display (not a priority, no demand yet)
- Widget analytics dashboard (can launch without detailed analytics)
- Webhooks (enterprise feature, not needed for initial users)
- Multi-language (international expansion later)
- Smart AI selection (advanced optimization, can improve later)
- Testimonial responses (engagement feature, not critical)

### Technical Decisions

- **Moderation Approach:** Start with heuristic rules, expand to AI post-MVP
  - Lower cost and complexity for MVP
  - Faster implementation
  - Can integrate OpenAI Moderation API in Phase 1

- **Avatar Storage:** Use existing Azure Blob Storage integration
  - Already configured for media uploads
  - Consistent with current architecture
  - CDN-ready for performance

- **Custom Fields:** JSON storage for flexibility
  - No schema changes needed for new field types
  - Easy to extend in future
  - Fast to implement

- **Rich Media:** Backend-only for MVP
  - Minimal development time (~2-3 hours)
  - API versioning maintained
  - Ready when feature becomes priority

### Implementation Guidelines

- All features must be **backward compatible** with existing widgets
- Database migrations must be **non-breaking**
- New features are **opt-in via configuration**
- Features can be **rolled out independently**
- All features include **comprehensive documentation**
- Admin UI updates are **intuitive and discoverable**

---

## 🤝 Next Steps

### Immediate Actions (This Week)

1. **Review & Approve** this feature plan
2. **Prioritize** MVP features in order of implementation
3. **Create** GitHub issues/tasks for each MVP feature
4. **Estimate** realistic timeline for MVP completion
5. **Set up** development branch for MVP features

### Development Sequence (Recommended)

**Day 1-2:** Verified Badge & Avatar Support (3-4 hours)
- High impact, relatively quick
- Builds user trust immediately
- Establishes avatar infrastructure

**Day 3-4:** Source Tracking (2-3 hours)
- Simple implementation
- Foundation for future analytics
- No UI complexity

**Day 5-7:** Auto-Moderation System (4-6 hours)
- Most complex MVP feature
- Critical for spam prevention
- Requires testing and tuning

**Day 8-9:** Custom Fields (4-5 hours)
- Flexible feature for users
- Shows platform customizability
- Competitive advantage

**Day 10:** Rich Media Routes (2-3 hours)
- Quick backend setup
- Future-proofing
- API documentation

**Day 11-12:** Testing, QA, Bug Fixes
- End-to-end testing
- Widget validation across layouts
- Admin UI polish
- Documentation updates

**Total MVP Timeline: ~2 weeks**

---

**Questions or feedback?** Review the MVP features and let's align on implementation order and timeline!
