# PT Sigma Core Solusindo — Company Profile

Next.js company-profile landing page.

## Architecture

```text
Browser
  └─ Next.js 16
      ├─ Public landing page
      │    └─ src/lib/landing-content.ts
      │         ├─ Solutions: public CMS REST API when CMS_API_URL is set
      │         └─ Other sections / standalone demo: src/content/site.ts
      └─ Contact form: currently disabled; Core API integration is separate work
```

The root application is the extracted Next.js public frontend (`src/app`). Payload
is not embedded in this application. Solutions can now be read server-side from
Payload through `CMS_API_URL` (for example `http://localhost:3101/api`). Leave it
empty for the existing six bundled demo solutions. When configured, the CMS is
authoritative: an empty/unpublished collection remains empty, and failures are not
silently replaced with bundled records. Public queries carry no admin credentials.

The extracted frontend currently integrates **Solutions only**. Its other content
is still bundled. Use the full CMS-backed testing application below when editing
partners, website settings, About, Workflow, and Strengths.

## Run locally

Requirements: Node.js 20+ and pnpm.

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
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

The current Nginx configuration also supports temporary recovery of the existing
Payload CMS container on `cms.sigmacore.id`. Read [CMS recovery](docs/CMS-RECOVERY.md)
before changing the live proxy or running a deployment on the legacy server.
Recovering the admin does not connect the public site's bundled content to the CMS.

## CMS-backed testing website

The isolated legacy Payload preview at `http://localhost:3101` now includes the
migrated solutions, website settings, About/Workflow/Strengths, and authenticated
draft–preview–publish with cache invalidation. Production deployment is unchanged.
See [testing content workflow](cms-ui/content-workflow/README.md).

The public font now matches the system-font stack used by sigmacore.id. Services
uses the same responsive Server Component in both apps. See the
[Services implementation notes](docs/SERVICES-REFINEMENT.md) for scope, cache behavior,
verification, and the public-only testing patch.

The transparent header and compact dark contact/navigation footer share the same public
styling in both apps. See [navigation refinement](cms-ui/navigation-refinement/README.md)
for the testing patch. CMS content and the floating WhatsApp action are preserved.

For the CMS origin, login/logout, preference reset and account-access fixes, see
[CMS auth repair](cms-ui/auth-repair/README.md). Apply it after the other legacy
patches and set `PAYLOAD_SERVER_URL` to the exact CMS origin, including its port.
