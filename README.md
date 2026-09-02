# PT Sigma Core Solusindo — Company Profile

Next.js company-profile landing page.

## Architecture

```text
Browser
  └─ Next.js 16
      ├─ Public landing page (bundled content, see content/site.ts)
      └─ /api/inquiries (BFF proxy)
             └─ Core API (CORE_API_URL, deployed separately)
```

The Payload CMS admin/API previously embedded in this repo now lives in its own project (`sigma-core-cms`). This repo currently serves bundled company-profile content directly from `content/site.ts` via `lib/landing-content.ts`; wiring that file up to fetch from the CMS over HTTP is a follow-up.

## Run locally

Requirements: Node.js 20+ and pnpm.

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Useful commands

```powershell
pnpm typecheck
pnpm build
```

## Production deployment

`compose.prod.yaml` runs the Next.js app behind Nginx. See `scripts/deploy-production.sh`.
