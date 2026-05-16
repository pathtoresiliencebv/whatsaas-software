# Kyrn GTM Plan - Todo List
**Status:** In Progress
**Last Updated:** 2026-05-16

## Legend
- [x] = Completed
- [ ] = Pending
- [>] = In Progress

---

## Week 1 - Branding & Website Basics

### 1.1 Logo Review/Updates
- [x] Logo component - Changed "W" to "K"
- [x] Logo component - Changed "WhatSaaS" to "Kyrn"
- [x] Create proper SVG logo file (public/logo.svg)
- [x] Update favicon to match "K" branding (public/favicon.svg)

### 1.2 Hero Text & Landing Page
- [x] Hero text - Updated to "The Most Powerful AI WhatsApp Platform"
- [x] CTA buttons - Updated to "Start 14-Day Free Trial"
- [x] Demo chat preview - Updated with Kyrn branding
- [x] Pricing page - Updated header to "AI WhatsApp. Your Rules."
- [x] Pricing page - Added 14-day trial messaging
- [ ] Social proof section - Add real testimonials/case studies
- [ ] Trust badges section - Stripe secure, GDPR compliant, 99.9% uptime

### 1.3 SEO Basics
- [x] Meta descriptions per page
- [x] Schema markup for SaaS (Organization, SoftwareApplication)
- [x] sitemap.xml generation (app/sitemap.ts)
- [x] robots.txt check (app/robots.ts)
- [ ] Blog section for SEO content

### 1.4 Brand Guidelines
- [x] Created `docs/brand-guidelines.md`
- [ ] Create downloadable logo assets for partners

---

## Week 2 - Conversion Optimisation

### 2.1 Pricing Page
- [ ] "Meest populair" badge styling
- [ ] Feature comparison matrix/table
- [ ] FAQ section on pricing/billing
- [ ] Trial logic verification (14 days)

### 2.2 FAQ Section
- [x] Add FAQ section to landing page
- [x] FAQ content for SEO (6 questions in EN/NL/ES/PT)

### 2.3 Trust & Social Proof
- [x] Trust badges (Stripe, GDPR, Uptime)
- [x] Customer testimonials section
- [ ] Case studies from early adopters
- [x] Stats/numbers section

### 2.4 Test Full Funnel
- [ ] Sign-up → Pricing → Stripe checkout flow
- [ ] Mobile responsive verification
- [ ] Test with Stripe test card

---

## Week 3 - Online Presence

### 3.1 Google Setup
- [ ] Google Search Console - claim & connect
- [ ] Google Analytics 4 setup
- [ ] Google Business Profile claim/create
- [ ] Google Ads account setup (for later)

### 3.2 Social Media Setup
- [ ] LinkedIn company page - "Kyrn"
- [ ] YouTube channel setup
- [ ] First YouTube tutorial video
- [ ] Twitter/X account for tech updates

### 3.3 Domain & Email
- [ ] SPF, DKIM, DMARC records
- [ ] info@kyrn.nl email verified

---

## Week 4 - Community & Partners

### 4.1 Community Platform
- [ ] Discord server for users/developers
- [ ] Telegram group for Dutch audience
- [ ] WhatsApp channel for updates

### 4.2 Referral Program
- [ ] "Earn free months" system
- [ ] Partner link tracking system
- [ ] Affiliate dashboard in admin

### 4.3 Partner Program
- [ ] Partner program page (/partners)
- [ ] Partner dashboard in admin
- [ ] Reseller pricing tier
- [ ] Partner API keys setup

### 4.4 Content Marketing
- [ ] First blog post
- [ ] Content calendar setup

---

## Technical Setup

### 6.1 Analytics & Tracking
- [ ] Vercel Analytics connection
- [ ] Hotjar or similar setup
- [ ] Stripe conversion tracking

### 6.2 Legal & Compliance
- [x] Algemene voorwaarden (/terms) - update default to Kyrn
- [x] Privacy policy (/privacy) - update default to Kyrn
- [x] Cookie consent banner (added to layout)
- [x] GDPR data export (already built)

### 6.3 Support
- [ ] Help center improvement (/docs)
- [ ] Status page (status.kyrn.nl)
- [ ] Ticket system integration

---

## Database Migration Needed

### Branding Update
- [x] Schema default updated to 'Kyrn'
- [ ] Update existing `branding` table record: `UPDATE branding SET name='Kyrn' WHERE id=1`

---

## Notes
- Brand color: Primary teal (oklch(0.69 0.17 145))
- Domain: kyrn.nl
- Email: info@kyrn.nl
