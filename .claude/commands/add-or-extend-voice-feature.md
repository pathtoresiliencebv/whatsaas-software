---
name: add-or-extend-voice-feature
description: Workflow command scaffold for add-or-extend-voice-feature in whatsaas-software.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-extend-voice-feature

Use this workflow when working on **add-or-extend-voice-feature** in `whatsaas-software`.

## Goal

Adds or extends a feature in the 'voice' product area, including dashboard pages, API endpoints, service logic, and database migrations.

## Common Files

- `app/[locale]/(dashboard)/voice/*/page.tsx`
- `app/api/voice/*/route.ts`
- `lib/voice/service.ts`
- `lib/db/schema.ts`
- `lib/db/migrations/*`
- `lib/permissions.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update dashboard UI pages under app/[locale]/(dashboard)/voice/*/page.tsx
- Create or update API route files under app/api/voice/*/route.ts
- Implement or modify service logic in lib/voice/service.ts and related files
- Update or add database schema and migrations in lib/db/schema.ts and lib/db/migrations/*
- Update permissions in lib/permissions.ts if needed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.