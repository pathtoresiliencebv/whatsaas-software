# CircleCI deployment

This repository deploys through CircleCI using `.circleci/config.yml`.

## Required CircleCI context

Create a CircleCI context named `vercel-deploy` and add these environment variables:

- `VERCEL_TOKEN`: a Vercel token with access to the project.
- `VERCEL_ORG_ID`: the Vercel team or account ID.
- `VERCEL_PROJECT_ID`: the Vercel project ID.

Keep these values in CircleCI only. Do not commit `.vercel/project.json` or local env files.

## Workflow

- Every branch runs `pnpm exec tsc --noEmit` and `pnpm test`.
- Non-`main` branches deploy a Vercel preview after checks pass.
- `main` deploys to Vercel production after checks pass.

The deploy jobs run `vercel pull`, `vercel build`, and `vercel deploy --prebuilt` so the same Vercel environment configuration is used in CI.

## Local checks

Before pushing deployment changes:

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

`pnpm build` needs the same required environment variables as the app. Use local env files only on your machine.
