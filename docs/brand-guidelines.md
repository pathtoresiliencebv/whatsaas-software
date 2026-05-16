# Kyrn Brand Guidelines

**Version:** 1.0
**Last Updated:** 2026-05-16
**Brand Name:** Kyrn
**Tagline:** "AI WhatsApp. Your Rules." / "Jouw Regels. Jouw AI."

---

## 1. Brand Identity

### 1.1 Brand Name
- **Primary:** Kyrn
- **Pronunciation:** "kern" (like "learn" without the "l")
- **Capitalization:** Always "Kyrn" (not "KYRN", "Kyrn", or "kyrn")

### 1.2 Tagline
- **English:** "AI WhatsApp. Your Rules."
- **Dutch:** "Jouw Regels. Jouw AI."
- **Spanish:** "IA WhatsApp. Tus Reglas."
- **Portuguese:** "IA WhatsApp. Suas Regras."

### 1.3 Brand Voice & Tone

**Voice Characteristics:**
- **Confident:** We know AI WhatsApp. We built the most powerful platform.
- **Direct:** No fluff. Tell users what we do and why it matters.
- **Practical:** Focus on real business outcomes, not buzzwords.
- **Premium:** Quality over quantity. We're not the cheapest, we're the best.

**Tone Guidelines:**
- Professional but approachable
- Technology-driven but human
- Confident but not arrogant
- Direct but respectful

**Do's:**
- Speak to business owners and entrepreneurs
- Focus on outcomes: "close more deals", "respond faster", "scale effortlessly"
- Use concrete numbers when possible
- Address pain points directly

**Don'ts:**
- Don't use jargon without explanation
- Don't be overly casual or use slang
- Don't make unsubstantiated claims
- Don't talk down to users

---

## 2. Visual Identity

### 2.1 Logo

**Primary Logo:**
- Letter "K" in a rounded square container
- Uses primary brand color (`--primary`)
- White text on colored background

**Logo with Wordmark:**
- "Kyrn" text appears next to the icon
- Font: Manrope Bold, 20px

**Clear Space:**
- Minimum clear space equal to the height of the "K" icon
- Logo should never be crowded by other elements

**Minimum Sizes:**
- Desktop: 32px height minimum
- Mobile: 24px height minimum
- Favicon: 32px x 32px

**Incorrect Usage:**
- Don't stretch or distort the logo
- Don't change the colors
- Don't add shadows or effects
- Don't place on busy backgrounds without contrast

### 2.2 Color Palette

**Primary Color:**
```
Name: Primary Teal
Hex: #06B7A4 (approximately)
CSS: oklch(0.69 0.17 145)
Usage: Primary actions, links, highlights
```

**Foreground on Primary:**
```
Name: Primary Foreground
CSS: oklch(0.986 0.031 120.757)
Usage: Text on primary color backgrounds
```

**Background:**
```
Light Mode: #FFFFFF (pure white)
Dark Mode: oklch(0.141 0.005 285.823)
```

**Foreground (Text):**
```
Light Mode: oklch(0.141 0.005 285.823)
Dark Mode: #FFFFFF
```

**Secondary/Neutral:**
```
CSS: oklch(0.967 0.001 286.375)
Usage: Secondary backgrounds, borders
```

**Chart Colors (for data visualization):**
```
Chart 1: oklch(0.871 0.15 154.449) - Blue
Chart 2: oklch(0.723 0.219 149.579) - Teal
Chart 3: oklch(0.627 0.194 149.214) - Green
Chart 4: oklch(0.527 0.154 150.069) - Yellow-green
Chart 5: oklch(0.448 0.119 151.328) - Orange
```

### 2.3 Typography

**Primary Font:**
- **Name:** Manrope
- **Type:** Sans-serif
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Usage:** All UI text, headings, body copy

**Monospace (for code/data):**
- **Name:** JetBrains Mono
- **Usage:** API keys, code snippets, technical data

**Font Sizes:**
```
H1: 3.75rem (60px) - Landing page hero
H2: 2.25rem (36px) - Section titles
H3: 1.5rem (24px) - Card titles
Body: 1rem (16px) - Default text
Small: 0.875rem (14px) - Secondary text
Caption: 0.75rem (12px) - Labels, hints
```

### 2.4 Iconography

**Primary Icons Library:**
- Lucide React (our component library)
- Consistent 24px default size
- 1.5px stroke weight

**Usage:**
- Use icons to enhance understanding, not decorate
- Maintain consistent sizing within context
- Use outlined style for navigation, filled for emphasis

### 2.5 Imagery

**Style:**
- Clean, modern, professional
- Show real business scenarios
- Include diverse people and teams
- Screenshots of actual product (not mockups)

**Illustrations:**
- Minimal, geometric style
- Use brand colors
- Abstract representations of AI/automation concepts

---

## 3. Logo Usage Rules

### 3.1 Correct Usage
- Use the provided logo files (SVG preferred)
- Maintain aspect ratio at all times
- Use on high-contrast backgrounds

### 3.2 Incorrect Usage
- Do not modify the logo colors
- Do not add effects (shadows, gradients, outlines)
- Do not rotate or flip the logo
- Do not place on busy backgrounds without sufficient contrast
- Do not use the logo smaller than minimum size
- Do not stretch or compress the logo

### 3.3 Dark Mode
- Logo icon uses `--primary` which adapts to dark mode
- Wordmark "Kyrn" uses `--foreground` which adapts

---

## 4. Application in UI

### 4.1 Primary Actions
- Background: `--primary` (teal)
- Text: `--primary-foreground` (white)
- Used for: Main CTAs, submit buttons, primary links

### 4.2 Secondary Actions
- Background: `--secondary`
- Text: `--secondary-foreground`
- Used for: Secondary buttons, outline variants

### 4.3 Accent/Highlights
- Background: `--accent`
- Used for: Subtle backgrounds, hover states

### 4.4 Borders & Dividers
- Color: `--border`
- Light: oklch(0.92 0.004 286.32)
- Dark: oklch(1 0 0 / 10%)

---

## 5. Messaging Guidelines

### 5.1 Headlines
**Format:** [Benefit-oriented statement]

**Examples:**
- "Automate your WhatsApp conversations"
- "Close more deals with AI-powered support"
- "Scale your business without scaling your team"

**Avoid:**
- Generic statements like "The best WhatsApp solution"
- Feature-first headlines without benefit context

### 5.2 CTAs (Call-to-Actions)
**Primary CTAs:**
- "Start 14-Day Free Trial"
- "Start Free Trial"
- "Get Started"

**Secondary CTAs:**
- "View Features"
- "See How It Works"
- "Learn More"

**Landing Page CTAs:**
- Always include a primary CTA above the fold
- Use action-oriented language
- Include benefit hint where possible

### 5.3 Social Proof
**Stats Format:**
- "[Number] [Metric] [Context]"
- Example: "500+ businesses trust Kyrn"

**Testimonials:**
- Include name, company, and photo when possible
- Focus on specific outcomes
- Keep to 2-3 sentences max

---

## 6. Domain & Website

### 6.1 Primary Domain
- **Domain:** kyrn.nl
- **Locale:** Dutch primary, English secondary

### 6.2 Key Pages
- `/` - Landing page
- `/pricing` - Pricing with 14-day trial
- `/docs` - Documentation
- `/contact` - Contact/sales inquiries
- `/sign-up` - Registration

### 6.3 URL Conventions
- Use lowercase
- Separate words with hyphens
- Keep URLs short and descriptive

---

## 7. Email Communication

### 7.1 Sender Details
- **From Name:** Kyrn
- **From Email:** info@kyrn.nl (default)

### 7.2 Email Tone
- Professional but friendly
- Clear subject lines
- Action-oriented CTAs
- Mobile-responsive design

---

## 8. Social Media

### 8.1 Platform Presences
- **LinkedIn:** Company page for Kyrn
- **YouTube:** Tutorial and demo videos
- **Twitter/X:** Tech updates and company news
- **Instagram:** Behind-the-scenes, tips, culture

### 8.2 Profile Conventions
- Profile photo: Logo
- Cover image: Brand visuals
- Bio: Clear value proposition with link

---

## 9. Legal & Compliance

### 9.1 Required Pages
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/cookies` - Cookie Policy

### 9.2 GDPR Compliance
- Data export functionality (built-in)
- Clear data retention policies
- Cookie consent banner

---

## 10. Partner Assets

Partners can request official assets by contacting info@kyrn.nl.

### 10.1 Available Assets
- Logo files (SVG, PNG, PDF)
- Brand color codes
- Product screenshots
- Feature icons

### 10.2 Partner Usage
- Partners may use Kyrn logo to indicate integration
- Partners may not imply official endorsement without written agreement
- Partners must follow these brand guidelines

---

## Appendix: Color Reference

### CSS Variables
```css
/* Light Mode */
--primary: oklch(0.69 0.17 145);
--primary-foreground: oklch(0.986 0.031 120.757);
--background: oklch(1 0 0);
--foreground: oklch(0.141 0.005 285.823);
--card: oklch(1 0 0);
--border: oklch(0.92 0.004 286.32);

/* Dark Mode */
--primary: oklch(0.69 0.17 145); /* Same */
--background: oklch(0.141 0.005 285.823);
--foreground: oklch(0.985 0 0);
--card: oklch(0.21 0.006 285.885);
--border: oklch(1 0 0 / 10%);
```

---

*Last reviewed: 2026-05-16*
*Next review: Quarterly*
*Document owner: Marketing Team*
