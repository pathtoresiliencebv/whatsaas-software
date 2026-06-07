# CircleCI deployment

This repository deploys through CircleCI using `.circleci/config.yml`.

## Required CircleCI context

Create a CircleCI context named `vercel-deploy` and add these environment variables:

- `VERCEL_TOKEN`: a Vercel token with access to the project.
- `VERCEL_ORG_ID`: `team_q4HhcOfAuotctUI1GJOwEENX`
- `VERCEL_PROJECT_ID`: `prj_7FEflxKkCGrOvYWolLKhhfPqE82C`

Keep these values in CircleCI only. Do not commit `.vercel/project.json` or local env files.

## Project setup

CircleCI CLI is installed locally. A new shell can use `circleci`; this session can use the installed binary directly.

After authenticating with `circleci setup`, initialize the CircleCI project with:

```bash
circleci init github/pathtoresiliencebv --project-name whatsaas-software --repo-id 1240803975 --pipeline-name whatsaas-main --trigger-name github-main
```

Then create the context and store secrets:

```bash
circleci context create <org-id> vercel-deploy
printf "%s" "$VERCEL_TOKEN" | circleci context store-secret <org-id> vercel-deploy VERCEL_TOKEN
printf "%s" "team_q4HhcOfAuotctUI1GJOwEENX" | circleci context store-secret <org-id> vercel-deploy VERCEL_ORG_ID
printf "%s" "prj_7FEflxKkCGrOvYWolLKhhfPqE82C" | circleci context store-secret <org-id> vercel-deploy VERCEL_PROJECT_ID
```

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
