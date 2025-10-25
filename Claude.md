# Try Lebs - AI Virtual Fashion Try-On Platform
## Project Summary & Implementation Guide

---

## 📋 Project Overview

**Try Lebs** is an AI-powered virtual try-on web platform designed for the Middle East and North Africa (MENA) region. Users upload a photo and a clothing image to get a realistic preview in seconds, reducing hesitation and return rates in fashion e-commerce.

### Key Features
- **Simple User Flow**: Upload → Generate → Download
- **Guest Sessions**: No sign-up required; one free try-on, then pay-per-use
- **Privacy-First**: Temporary storage (≤60 min) with automatic deletion
- **Multi-language**: Arabic (default) & English support
- **Mobile-First Design**: Responsive and accessible interface

---

## 🎯 Target Market

**Primary Markets**: Egypt, KSA, GCC countries
**User Segments**: 
- B2C shoppers (pay-per-try)
- B2B brands (API access)
- B2B2C marketplaces

---

## 💰 Financial Projections (24-Month)

### Year 1 Key Metrics
- **Month 1**: 700 users, 2,610 tries, $652.50 revenue
- **Month 12**: 5,765 users, 36,031 tries, $9,007.75 revenue
- **Infra Cost**: Scales from $117.45 to $1,441.24/month

### Year 2 Growth
- **Month 24**: 24,975 users, 224,775 tries, $56,193.75 revenue
- **Profitability**: Achieves positive margin by Month 6+

### Revenue Streams
1. **Pay-Per-Try**: $0.25 per try-on
2. **Bundles**: 10 tries for $2.00
3. **Monthly Pass**: $9.99/month unlimited
4. **Brand API**: From $499/month

### Unit Economics
- Variable cost per try: $0.05 at scale
- Target pricing: $0.20-$0.30
- Gross margin: 60-75%

---

## 🛠️ Technical Architecture

### Frontend
- **Framework**: React (Vite SPA)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks/Context
- **Performance**: Core Web Vitals optimized

### Backend
- **API**: FastAPI (or Express.js alternative)
- **Endpoints**:
  - `POST /api/tryon` - Generate try-on
  - `GET /api/tryon/{id}` - Retrieve result
  - `POST /api/delete` - Delete session
  - `GET /api/gallery` - Admin gallery
- **Queue**: Redis job queue
- **Storage**: S3/MinIO with pre-signed URLs

### AI/ML Layer
- **Primary**: Kolors VTO (commercial license required)
- **Fallback**: FASHN API or Pixelcut
- **Worker**: Docker containerized processing
- **Model**: Virtual try-on neural network

### Infrastructure
- **Security**: OWASP ASVS Level 2+, HTTPS, CSP headers
- **File Validation**: Type whitelist, EXIF stripping
- **Accessibility**: WCAG 2.2 AA compliance
- **Performance Targets**:
  - LCP: <2.5s
  - INP: <100ms
  - CLS: <0.1

---

## 🔒 Privacy & Compliance

- **Data Storage**: Temporary only (≤60 minutes)
- **Consent**: Explicit banner (PDPL/GDPR aligned)
- **Deletion**: Manual option + auto-expiration
- **Regulations**: Egyptian PDPL Law 151/2020, GDPR basics
- **Zero PII Retention**: Images deleted automatically

---

## 📅 Development Roadmap (6 Months)

| Month | Milestone | Tasks |
|-------|-----------|-------|
| M1 | Licensing + Design | Finalize AI license, complete UI/UX design |
| M2 | MVP Development | React frontend, FastAPI backend, Redis setup |
| M3 | Testing + Payments | QA, payment gateway integration, security audit |
| M4 | Launch Egypt/KSA | Go-live, localization, marketing prep |
| M5 | Brand API Pilot | API documentation, early partner pilots |
| M6 | Scale + PWA | Progressive Web App, performance optimization |

---

## ⚠️ Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI License Denial | High | Use FASHN/Pixelcut commercial APIs as fallback |
| Privacy Violations | Critical | Implement strict PDPL/GDPR controls, audit regularly |
| High GPU Costs | Medium | Batch processing, volume discounts, edge inference |
| Market Adoption | Medium | Partner with brands, aggressive referral program |

---

## 💼 Investment Ask

**Seed Round**: USD $100,000
- **AI Infrastructure**: GPU compute credits, model licenses
- **Marketing**: Influencer partnerships, paid acquisition
- **Operations**: Legal, compliance, team expansion
- **Use of Funds**: 40% infra, 40% marketing, 20% ops

---

## 🎨 Branding & Design Reference

### Color Palette (Inspired by iKnow)
- **Primary**: Navy Blue (#001F4D) - Trust, professionalism
- **Secondary**: Gold (#D4A574) - Luxury, elegance
- **Accent**: Teal/Turquoise (#20A39E) - Vibrancy, innovation
- **Neutral**: Off-white (#F5F5F5) - Clean backgrounds
- **Text**: Dark Gray (#2C3E50) - Readability

### Typography
- **Headings**: Arabic-optimized sans-serif (Segoe UI, Cairo, Droid Arabic Kufi)
- **Body**: Open Sans, Inter (excellent Arabic support)
- **Font Weights**: Regular (400), Semi-bold (600), Bold (700)

### Design Principles
- **RTL-First**: Arabic as default layout direction
- **Accessible**: WCAG 2.2 AA minimum
- **Mobile-Optimized**: 320px minimum width
- **Interactive**: Smooth animations, visual feedback
- **Inclusive**: Support for 60+ seconds on operations

---

## 🌍 Localization Strategy

### Language Support
- **Default**: Arabic (Moroccan, Egyptian, Gulf variants)
- **Secondary**: English
- **Future**: French, Turkish

### Regional Customization
- **Currency**: Display USD internally, show local (EGP, SAR, etc.)
- **Payment**: Accept Telr, HyperPay, Apple Pay, card payments
- **Content**: Region-specific fashion trends, sizing guides
- **Support**: Arabic-speaking customer service (24/5)

---

## 📱 User Experience Flow

### Guest User Journey
1. **Landing Page**: Hero with value prop in AR/EN
2. **Upload**: Drag-drop person photo + garment image
3. **Generation**: Show loading with progress estimate
4. **Result**: Display high-quality try-on preview
5. **Download**: Save image, option to share
6. **Checkout**: Bundle/pass purchase on retry

### Registered User (Future)
1. **Dashboard**: View history, saved favorites
2. **Subscription**: Manage active plan
3. **Analytics**: Usage stats, trending items
4. **Referral**: Earn credits on referrals

---

## 🔧 Implementation Tasks for Claude Code

### Task 0: Critical Bug Fixes (October 2025)
**Issue**: 504 Gateway Timeout on production `/api/tryon` endpoint
- **Root Cause**: 60-second Vercel function timeout, Gradio AI service can take longer
- **Affected File**: `app/api/tryon/route.ts`, `vercel.json`
- **Priority**: CRITICAL - Blocking all try-on functionality
- **Status**: ✅ COMPLETED

**Fixes Implemented**:
- [x] Identify root cause of 504 timeout
- [x] Increase `maxDuration` from 60s to 120s in both `vercel.json` and `route.ts`
- [x] Add retry logic with exponential backoff (3 retries for connection, 2 for prediction)
- [x] Implement better error messages (distinguish timeout, connection, and fetch errors)
- [x] Add detailed logging for debugging (processing time, file sizes, etc.)
- [x] Return `processingTime` in API response for monitoring
- [x] Implement correct Kolors API with all 4 required parameters (person_img, garment_img, seed, randomize_seed)
- [x] Add comprehensive progress indicator with bilingual messages
- [x] Fix logo background color to match panel (white background)
- [x] Apply Cairo font universally for Arabic and English
- [ ] Add request queue for high load (future enhancement)
- [ ] Test with production-like images (ready for testing)
- [ ] Document Gradio service SLA and expected response times (future task)

**Changes Made**:
1. **vercel.json**: Increased `maxDuration` to 120 seconds
2. **app/api/tryon/route.ts**:
   - Added `retryWithBackoff()` helper function
   - Retry logic for Gradio client connection (3 attempts, 2s initial delay)
   - Retry logic for AI prediction (2 attempts, 3s initial delay)
   - Retry logic for image fetching (3 attempts, 1s initial delay)
   - Enhanced error handling with specific error types (timeout, connection, fetch)
   - Added processing time tracking and logging with unique request IDs
   - User-friendly error messages
   - **Correct Kolors API implementation**: Updated predict call to include all 4 parameters:
     ```typescript
     await client.predict("/tryon", [
       personBlob,      // Parameter 1: person_img
       clothingBlob,    // Parameter 2: garment_img
       42,              // Parameter 3: seed (fixed seed for consistency)
       false            // Parameter 4: randomize_seed (false to use fixed seed)
     ])
     ```
3. **app/page.tsx**:
   - Added progress indicator state (processingStep, estimatedTime)
   - Implemented bilingual step-by-step progress messages (6 steps)
   - Added visual progress bar with gradient animation
   - Fixed logo background color (bg-white rounded-lg p-1)
4. **app/globals.css**:
   - Imported Cairo font from Google Fonts
   - Applied Cairo universally to all text (`:lang(ar)`, `:lang(en)`, `*`)
   - Set Cairo as primary font family in CSS variables

**Technical Details**:
- External dependency: Hugging Face Gradio API (`Kwai-Kolors/Kolors-Virtual-Try-On`)
- No caching implemented (each request hits external service)
- Base64 conversion increases memory usage
- No fallback AI service configured (future enhancement)

### Task 1: Project Summary Documentation
- [x] Create this Claude.md file
- [x] Document API specifications (see Task 0)
- [x] Create technical debt backlog (see Task 0)
- [ ] Extract key metrics into dashboard

### Task 2: Logo Integration
**File**: `public/logo.png`
**Status**: ✅ COMPLETED
**Implementation**:
```
- [x] Add logo files to public directory (logo.png - 946KB)
- [x] Add logo to header (responsive sizing: 48px mobile, 64px desktop)
- [x] Add favicon from logo (configured in layout.tsx)
- [x] Add logo to footer (64px centered)
- [ ] Create SVG version for scalability (future optimization)
- [ ] Implement logo animation on hover (future enhancement)
```

**Changes Made**:
1. **public/logo.png**: Added beautiful TryLebs logo featuring:
   - Navy blue dress with geometric network pattern
   - Gold circular background and dress accents
   - "Try Lebs" text (Navy + Gold)
   - "AI VIRTUAL FASHION" subtitle

2. **app/page.tsx**:
   - Header: Logo displayed with responsive sizing (h-12 sm:h-16)
   - Footer: Logo centered with brand information

3. **app/layout.tsx**:
   - Added favicon link tags
   - Added apple-touch-icon for iOS devices

4. **public/LOGO_INSTRUCTIONS.md**:
   - Created documentation for logo specifications

### Task 3: Brand Color & Typography Implementation
**Status**: ✅ COMPLETED
**Design System**:
```css
/* Primary Colors */
--color-navy: #001F4D;
--color-gold: #D4A574;
--color-teal: #20A39E;
--color-white: #F5F5F5;
--color-dark: #2C3E50;

/* Typography */
--font-primary: 'Cairo', 'Droid Arabic Kufi', sans-serif;
--font-secondary: 'Inter', 'Open Sans', sans-serif;
--font-size-base: 16px;
--line-height: 1.6;
```

**Changes Implemented**:
1. **tailwind.config.ts**:
   - Added navy color palette (50-900 shades)
   - Added gold color palette (50-900 shades)
   - Added teal color palette (50-900 shades)
   - Added Arabic-optimized font families
   - Configured typography settings

2. **app/globals.css**:
   - Imported Google Fonts (Cairo, Inter, Open Sans)
   - Added CSS variables for brand colors
   - Configured font families for Arabic and English
   - Set proper font size and line height

3. **app/page.tsx**:
   - Updated background gradient (navy-50, teal-50, gold-50)
   - Changed header logo color to teal
   - Updated "How It Works" cards with brand colors
   - Changed CTA button gradient (navy to teal)

**Applied to**:
- [x] Hero section background
- [x] Button styling (primary/secondary)
- [x] Card components
- [x] Navigation bar
- [x] Form elements
- [x] Text hierarchy

### Task 4: Arabic as Default Language
**Status**: ✅ COMPLETED
**Implementation**:
```
- [x] Set HTML lang="ar" by default
- [x] Implement RTL layout (dir="rtl")
- [x] Set Arabic as default language in page state
- [x] Arabic translations already exist in lib/translations.ts
- [x] Language toggle (AR/EN) already implemented
- [ ] Persist language preference (future enhancement - localStorage)
- [ ] Update all API responses for Arabic (future enhancement)
```

**Changes Made**:
1. **app/layout.tsx**:
   - Changed `lang="en"` to `lang="ar"`
   - Changed to `dir="rtl"` for right-to-left layout
   - Added `font-arabic` class to body
   - Updated metadata with bilingual title and description
   - Added Arabic keywords for SEO

2. **app/page.tsx**:
   - Changed default language from `'en'` to `'ar'`
   - Page already had full RTL support and language switching

3. **app/globals.css**:
   - Already had RTL support styles
   - Added `:lang(ar)` and `:lang(en)` font selectors

**Translation Coverage**:
All UI text already has Arabic translations in `lib/translations.ts`:
- Title, subtitle, description
- Upload prompts and placeholders
- Button labels (Try On, Download, Try Another)
- Processing and result messages
- How It Works section
- Footer text

---

## 📐 Website Inspiration: iKnow Structure

### Layout Elements to Adapt
1. **Hero Section**: Eye-catching headline, animated visual
2. **Features Grid**: 4-column responsive grid
3. **How It Works**: Step-by-step carousel/timeline
4. **Testimonials**: Slider with user quotes
5. **FAQ Accordion**: Common questions
6. **Pricing Cards**: Feature comparison
7. **CTA Sections**: Multiple conversion points
8. **Footer**: Links, social, newsletter signup

### Component Library (iKnow Reference)
- Colorful icon sets (custom SVGs)
- Animated counters
- Image grids with overlays
- Badge/badge components
- Progress bars
- Modal/popup components

---

## 🚀 Quick Start Commands

```bash
# Setup
npm install
npm run dev

# Build
npm run build

# Format
npm run format:ar  # For Arabic content

# Deploy
npm run deploy

# Test
npm run test
npm run a11y  # Accessibility testing
```

---

## 📊 Success Metrics

### User Metrics
- **Time-to-Try-On**: ≤ 20 seconds
- **Completion Rate**: ≥ 70%
- **Retry Rate**: ≥ 40%
- **Share Rate**: ≥ 15%

### Technical Metrics
- **Uptime**: 99.9%
- **Core Web Vitals**: All green
- **Error Rate**: < 0.1%
- **API Response**: < 500ms avg

### Business Metrics
- **CAC**: < $2 per user
- **LTV**: > $50 (target)
- **Conversion**: 8-12% from try-on to purchase
- **Monthly Growth**: 15-20%

---

## 🔗 Resources & Links

- **Website**: https://trylebs.ai
- **Investor Package**: TryLebs_Investor_Package.pdf
- **Financials**: TryLebs_Financials_1.xlsx, TryLebs_Financials_2.xlsx
- **Brand Assets**: Gemini_Generated_Image_*.png
- **Reference**: https://iknow-sa.com/

---

## 📝 Notes for Development Team

### Critical Path Items
1. **AI License**: Confirm Kolors or FASHN arrangement (blocking M1→M2)
2. **Payment Integration**: Test all regional methods early (M2)
3. **Mobile Testing**: Start on iPhone 12 mini (320px) (M3)
4. **RTL Testing**: Use browser DevTools to simulate (continuous)
5. **Privacy Audit**: Get legal sign-off before M4 launch (M3)

### Team Assignments
- **Frontend**: React, design system, RTL implementation
- **Backend**: FastAPI, Redis, S3 integration
- **DevOps**: Docker, CI/CD, infrastructure
- **QA**: Cross-browser, accessibility, privacy testing
- **Product**: Analytics, user research, roadmap

---

## 🎓 Learning Resources

- **WCAG 2.2**: https://www.w3.org/WAI/WCAG22/quickref/
- **RTL Design**: https://rtlstyling.com/
- **Arabic Typography**: Google Fonts Arabic collection
- **Virtual Try-On**: Research Kolors, FASHN documentation
- **Privacy Law**: Egyptian PDPL resources

---

## ✅ Acceptance Criteria

### Phase 1: Foundation (M1-M2)
- [ ] React + FastAPI setup complete
- [ ] Logo integrated and responsive
- [ ] Brand colors applied to all UI components
- [ ] Arabic as default language with full RTL support
- [ ] iKnow-inspired design system implemented
- [ ] All pages render correctly in AR/EN

### Phase 2: MVP (M3-M4)
- [ ] Payment processing working
- [ ] AI integration tested
- [ ] Mobile experience optimized
- [ ] Security audit passed
- [ ] Privacy controls verified
- [ ] Launch-ready in Egypt & KSA

### Phase 3: Growth (M5-M6)
- [ ] Brand API documented and piloted
- [ ] PWA features implemented
- [ ] Partnerships established
- [ ] Analytics dashboard live
- [ ] Referral program active

---

## 📞 Support & Questions

For implementation clarifications:
- Check technical specifications in associated PDFs
- Review financial projections for resource allocation
- Reference iKnow design system for visual guidance
- Consult brand assets for logo usage

**Last Updated**: October 25, 2025
**Version**: 1.1
**Status**: Foundation Complete, Ready for Testing & Deployment

---

## 📝 Recent Updates (October 25, 2025)

### Completed Tasks ✅

#### 1. Critical Bug Fix - 504 Gateway Timeout
- **Problem**: Production API endpoint timing out at 60 seconds
- **Solution**:
  - Increased timeout to 120 seconds
  - Added retry logic with exponential backoff
  - Enhanced error handling and user feedback
  - Added performance monitoring
- **Files Modified**: `app/api/tryon/route.ts`, `vercel.json`

#### 2. Brand Design System Implementation
- **Completed**: Full brand color palette and typography
- **Colors Added**: Navy, Gold, Teal with full shade ranges (50-900)
- **Typography**: Cairo for Arabic, Inter/Open Sans for English
- **Files Modified**: `tailwind.config.ts`, `app/globals.css`, `app/page.tsx`

#### 3. Arabic Language as Default
- **Completed**: Full Arabic/RTL support activated
- **Features**:
  - Arabic set as default language
  - RTL layout enabled
  - Bilingual SEO metadata
  - All UI elements translated
- **Files Modified**: `app/layout.tsx`, `app/page.tsx`

#### 4. Logo Integration
- **Completed**: Full logo integration across the site
- **Features**:
  - Header logo with responsive sizing
  - Footer logo centered display
  - Favicon and Apple touch icon
  - Logo perfectly matches brand colors (Navy + Gold)
- **Files Modified**: `app/page.tsx`, `app/layout.tsx`, `public/logo.png`

### Known Issues ⚠️

1. **Node.js Version**: ✅ RESOLVED (Downgraded to Next.js 14)
   - **Status**: Dev server running successfully
   - **Solution**: Downgraded from Next.js 15 to 14.2.18, React 19 to 18.3.1
   - **Compatibility**: Now works with Node.js 18.17.0
   - **Files Modified**: `package.json`, `next.config.js` (converted from .ts)

2. **Logo Files**: ✅ RESOLVED
   - **Status**: Logo successfully integrated
   - **File**: `/public/logo.png` (946KB)
   - **Features**: Header, footer, and favicon all configured
   - **Styling**: White background matching header panel

### Next Steps 🎯

1. **Immediate** (Testing Phase):
   - [x] Local dev server running successfully
   - [x] All code implementations complete
   - [ ] **Test the updated API** - Make a try-on request in the browser
   - [ ] Verify Kolors API works with 4 parameters
   - [ ] Check comprehensive logging output

2. **Short Term** (After Testing):
   - [ ] Deploy to Vercel production
   - [ ] Monitor API response times in production
   - [ ] Test with various image sizes
   - [ ] Add language preference persistence (localStorage)
   - [ ] Verify 120s timeout resolves the 504 error

3. **Medium Term** (This Month):
   - [ ] Implement caching for repeated try-ons
   - [ ] Add request queue for high traffic
   - [ ] Set up monitoring/analytics dashboard
   - [ ] Test with real users and gather feedback
   - [ ] Consider upgrading to Next.js 15 after Node.js upgrade

### Deployment Checklist

Before deploying to production:
- [x] 504 timeout fix implemented (increased to 120s)
- [x] Retry logic with exponential backoff added
- [x] Correct Kolors API implementation (4 parameters)
- [x] Progress indicator with bilingual messages
- [x] Brand colors applied
- [x] Arabic as default language
- [x] Logo integrated (header + footer)
- [x] Favicon created
- [x] Logo background fixed (white matching panel)
- [x] Cairo font applied universally
- [x] Node.js compatibility resolved (Next.js 14)
- [x] Local dev server running successfully
- [x] Comprehensive logging with request IDs
- [ ] **Local testing with try-on request** (NEXT CRITICAL STEP)
- [ ] Error messages tested in both languages
- [ ] RTL layout verified across all browsers
- [ ] Performance monitoring enabled in production

**Current Status**: ✅ All implementations complete. Dev server running at http://localhost:3000
**Next Action**: Test the try-on functionality in the browser to verify the Kolors API works correctly.
