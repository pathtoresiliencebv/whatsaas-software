# CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. Test (`test.yml`)
Runs on every PR and push to main. Executes the Vitest test suite.

**No secrets required** - uses mock environment variables.

### 2. Build (`build.yml`)
Runs on every PR and push to main. Performs a full Next.js production build.

**No secrets required** - uses mock environment variables.

### 3. Deploy (`deploy.yml`)
Runs on merge to main. Deploys to Vercel.

**Requires secrets:**
- `VERCEL_TOKEN` - Vercel API token

**Optional secrets for full functionality:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `AUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_GENAI_API_KEY`
- `EVOLUTION_API_URL`
- `NEXT_PUBLIC_EVOLUTION_WEBHOOK_URL`
- `NEXT_PUBLIC_EVOLUTION_WEBHOOK_TOKEN`
- `PUSHER_APP_ID`
- `PUSHER_SECRET`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`
- `NEXT_PUBLIC_APP_URL`
- `ALLOWED_ORIGIN`
- `BASE_URL`

## Setup

### 1. Add Vercel Token
1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Create a new token with access to your project
3. Add to GitHub: Settings → Secrets → Actions → New repository secret
   - Name: `VERCEL_TOKEN`
   - Secret: your token value

### 2. (Optional) Add Other Secrets
For full production builds with all features, add the remaining secrets to GitHub Actions.

### 3. Enable GitHub Actions
The workflows will automatically run once merged to the repository.

## Manual Deployment
To trigger a manual deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Choose environment (preview or production)

## Local Build Test
To test the build locally:
```bash
pnpm build
```

## Local Test
To run tests locally:
```bash
pnpm test
```
