```markdown
# whatsaas-software Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides a comprehensive guide to the development patterns used in the `whatsaas-software` TypeScript codebase. It covers coding conventions, file organization, workflow automation, and testing practices. The repository focuses on modular, feature-driven development, with a strong emphasis on maintainability and clear commit standards.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `voiceService.ts`, `userPermissions.ts`

### Import Style
- Use **alias imports** for clarity and maintainability.
  ```typescript
  import voiceService from 'lib/voice/service';
  import { getUser } from 'lib/user';
  ```

### Export Style
- Use **default exports** for modules.
  ```typescript
  // lib/voice/service.ts
  const voiceService = { /* ... */ };
  export default voiceService;
  ```

### Commit Messages
- Use **Conventional Commits**.
- Prefix with `feat` for new features.
  - Example: `feat: add voice dashboard page`

## Workflows

### Add or Extend Voice Feature
**Trigger:** When adding a new voice-related feature or expanding existing voice functionality  
**Command:** `/new-voice-feature`

1. **Create or update dashboard UI pages**
   - Location: `app/[locale]/(dashboard)/voice/*/page.tsx`
   - Example:
     ```typescript
     // app/en/(dashboard)/voice/call/page.tsx
     import VoiceDashboard from 'components/voice/VoiceDashboard';
     export default function CallPage() {
       return <VoiceDashboard />;
     }
     ```
2. **Create or update API route files**
   - Location: `app/api/voice/*/route.ts`
   - Example:
     ```typescript
     // app/api/voice/start/route.ts
     import voiceService from 'lib/voice/service';
     export default async function handler(req, res) {
       // ...
     }
     ```
3. **Implement or modify service logic**
   - Location: `lib/voice/service.ts` and related files
   - Example:
     ```typescript
     // lib/voice/service.ts
     const startCall = (params) => { /* ... */ };
     export default { startCall };
     ```
4. **Update or add database schema and migrations**
   - Schemas: `lib/db/schema.ts`
   - Migrations: `lib/db/migrations/*`
   - Example:
     ```typescript
     // lib/db/schema.ts
     export const VoiceCall = {
       id: Number,
       userId: Number,
       startedAt: Date,
     };
     ```
5. **Update permissions if needed**
   - Location: `lib/permissions.ts`
   - Example:
     ```typescript
     // lib/permissions.ts
     export const canStartVoiceCall = (user) => user.role === 'admin';
     ```
6. **Add or update tests**
   - Location: `lib/voice/__tests__/*`
   - Example:
     ```typescript
     // lib/voice/__tests__/service.test.ts
     import voiceService from '../service';
     test('starts a call', () => {
       // ...
     });
     ```
7. **Update shared components**
   - Locations: `components/voice/*` or `components/interface/*`
   - Example:
     ```typescript
     // components/voice/VoiceDashboard.tsx
     export default function VoiceDashboard() { /* ... */ }
     ```

## Testing Patterns

- **Test files** are named with the pattern `*.test.*`.
- **Testing framework** is not explicitly specified; use standard TypeScript/Jest patterns.
- Example test file:
  ```typescript
  // lib/voice/__tests__/service.test.ts
  import voiceService from '../service';
  describe('voiceService', () => {
    it('should start a call', () => {
      // test logic
    });
  });
  ```

## Commands

| Command             | Purpose                                             |
|---------------------|-----------------------------------------------------|
| /new-voice-feature  | Scaffold and guide the process to add or extend a voice-related feature |
```
