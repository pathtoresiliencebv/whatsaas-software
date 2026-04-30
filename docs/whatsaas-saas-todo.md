# WhatSaaS — SaaS Todo-Lijst

**Bron**: Codecanyon #61257201 — Multitenant WhatsApp Sales/Support Chatbots + Flow Builder + API Access
**Datum**: 2026-04-30
**Doel**: Omzetten naar verkoopbare SaaS

---

## Project Overzicht

| Categorie | Technologie |
|---|---|
| Framework | Next.js 16 + React 19 + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Betalingen | Stripe (abonnementen) + Razorpay + Offline payments |
| AI | OpenAI GPT-4 + Google Gemini |
| WhatsApp | Evolution API + WhatsApp Cloud API (Meta) |
| Flow Builder | React Flow (@xyflow/react) — visueel |
| Chat | Realtime via Pusher |
| Voice | Twilio (bellen) |
| E-mail | Resend |
| Auth | JWT sessions + API keys |
| i18n | EN, PT, ES (next-intl) |
| UI | shadcn/ui + Tailwind 4 |
| Rollen | Owner / Admin / Agent (permissions) |

---

## 1. Beveiliging (Kritiek — voor live gaan)

- [ ] **Rate limiting** — De `/api/` routes hebben nauwelijks rate limits. Voeg per-tenant limieten toe (bv. `lib/rate-limit.ts` is aanwezig maar moet strenger)
- [ ] **API key scoping** — API keys moeten per team beperkt worden tot hun eigen data (tenant isolation op API-niveau)
- [ ] **Webhook verificatie** — Stripe webhook secret controleren, Evolution webhook token valideren
- [ ] **Input sanitization** — Alle API inputs zijn gevalideerd met Zod, maar WhatsApp-nummer formatting consistent maken
- [ ] **CORS & CSP headers** — Voeg security headers toe in `next.config.ts`
- [ ] **Audit logging** — `lib/audit/logger.ts` bestaat al; check of alle kritische acties gelogd worden

---

## 2. Betalingen & Billing (Kritiek)

- [ ] **Stripe live keys** — Vervang test keys door live keys in env
- [ ] **Razorpay integratie afmaken** — Razorpay adapter bestaat maar is mogelijk niet volledig getest
- [ ] **Betaalmethodes per land** — iDEAL, Bancontact, PayPal toevoegen voor EU-markt
- [ ] **Prijsstrategie bepalen** — Welke plannen? Hoeveel per maand? Welke features achter welk plan? (zie `plans` tabel met feature flags)
- [ ] **Trial days** — Stripe trial period is al geconfigureerd per plan
- [ ] **Offline payment flow** — Admin moet offline betalingen handmatig goedkeuren (`PendingPayments.tsx` bestaat al)
- [ ] **Refundbeleid** — Implementeren of aangeven in terms

---

## 3. Infrastructuur & Deployment

- [ ] **Docker-compose productie** — Huidige `docker-compose.yml` is alleen voor Postgres; Voeg Next.js app + Redis (voor sessions) + Traefik/Caddy toe
- [ ] **Environment variables** — Alle variabelen uit `.env.example` configureren (ook `RESEND_API_KEY`, `EVOLUTION_API_URL`, etc.)
- [ ] **Database hosting** — Van lokaal naar RDS/Supabase/Neon PostgreSQL
- [ ] **Evolution API hosting** — WhatsApp-verbinding heeft een Evolution API server nodig (self-hosted of via hosted oplossing)
- [ ] **SSL & Domain** — Vercel/AWS/DigitalOcean met SSL
- [ ] **CI/CD pipeline** — GitHub Actions voor test + deploy

---

## 4. Multi-Tenancy & White-Label

- [ ] **Branding per tenant** — `chat-theme` + `branding` tabellen zijn aanwezig; white-label panel in admin checken
- [ ] **Custom domain per tenant** — Optioneel: elk team hun eigen subdomein (`acme.whatsaas.com`)
- [ ] **Quota's per plan** — Max contacts, max users, max instances worden al gechecked via `enforceFeature()` in `lib/limits.ts`

---

## 5. WhatsApp-specifiek (Anti-ban & Compliance)

- [ ] **WhatsApp ban preventie** — Volume limits, message delays, geen spam; Flow Builder spamdetectie toevoegen
- [ ] **Template goedkeuring** — WABA templates moeten door Meta goedgekeurd worden;heer `templates` API + sync met Meta
- [ ] **Evolution API hosting** — Dit is de bridge naar WhatsApp; betrouwbare hosting nodig (anders WhatsApp-verbinding valt weg)
- [ ] **Multi-device support** — Check of meerdere WhatsApp-apparaten per instance werken

---

## 6. Gebruikerservaring & Onboarding

- [ ] **Onboarding flow** — Nieuwe gebruiker moet stap-voor-stap begeleid worden: account → team → WhatsApp connecten → eerste automatisering
- [ ] **QR-code connectie** — WhatsApp scan-QR is er al (`qrcode` endpoint), maar moet mobile-friendly
- [ ] **Documentatie** — `/docs` pagina bestaat maar is een placeholder; Vul met echte handleidingen
- [ ] **API documentatie** — `/api/v1/send` werkt; voeg volledige API referentie toe (Swagger/OpenAPI)
- [ ] **Demo video / GIF** — Toon flow builder en AI agent aan potentiele klanten

---

## 7. SaaS-specifieke Features

- [ ] **Gebruiker delete account** — `user/delete` route bestaat al
- [ ] **Export data (GDPR)** — Dataportabiliteit voor EU-klanten
- [ ] **E-mail verificatie verplicht** — Check of e-mail bevestiging werkt bij signup
- [ ] **Wachtwoord reset** — `forgot-password` flow is er al
- [ ] **Teamleden uitnodigen** — `invitations` tabel + UI zijn er; SMTP/Resend moet correct werken

---

## 8. AI & Automations

- [ ] **AI prompts tunen** — OpenAI/Gemini prompts staan in `lib/plugins/ai-chat/`; per use-case (sales, support) optimaliseren
- [ ] **Flow builder variabelen** — Documenteren welke variabelen beschikbaar zijn in flows
- [ ] **AI tools** — De AI tools (search, knowledge base, etc.) zijn er; check of alles werkt
- [ ] **Analytics dashboard** — `/analytics` pagina bestaat;ombeeld en stats toevoegen

---

## 9. Zakelijk (voor verkoop als SaaS)

- [ ] **Landing page** — Huidige `/` is generic; aparte marketing landing page bouwen met case studies, prijzen, features
- [ ] **Terms of Service** — `/terms` pagina is er; juridisch laten reviewen
- [ ] **Privacy Policy** — `/privacy` is er; GDPR-conform maken (cookie consent, data retention)
- [ ] **Cookie banner** — GDPR cookie consent toevoegen
- [ ] **Support systeem** — `/contact` pagina is er; email via Resend is geconfigureerd
- [ ] **SLA** — Beschikbaarheidsgarantie bepalen en communiceren

---

## 10. Tests & Kwaliteit

- [ ] **Vitest tests runnen** — `pnpm test` draait al; check of alle tests slagen
- [ ] **WhatsApp provider tests** — `evolution-provider.test.ts` en `meta-cloud-provider.test.ts` zijn er; uitbreiden
- [ ] **E2E tests** — Playwright/Cypress tests toevoegen voor kritische flows (signup, betaling, WhatsApp connect)
- [ ] **Load testing** — Check of de app meerdere tenants aankan

---

## Prioriteit voor MVP (om snel te verkopen)

1. **BEVEILIGING** — Rate limits, API isolation, webhook security
2. **STRIPE LIVE** — Echte betalingen ontvangen
3. **EVOLUTION API HOST** — WhatsApp moet werken (zonder dit is de app nutteloos)
4. **DOCUMENTATIE** — Anders verlopen klanten snel
5. **LANDING PAGE** — Om nieuwe klanten te werven
6. **ONBOARDING** — Anders haken af na signup
