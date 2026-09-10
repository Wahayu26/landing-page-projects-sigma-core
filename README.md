# Sigma Core Company Profile Website

Standalone Next.js public website for PT Sigma Core Solusindo. Payload CMS lives
in the separate `scs-company-profile-cms` repository and is the only application
that connects directly to PostgreSQL.

## Architecture

```text
Browser -> Next.js website -> Payload REST API -> PostgreSQL (scs_cms)
                 |  ^                 |
                 |  |                 +-> signed preview URL
                 |  +---- signed cache-revalidation webhook
                 +------> Core API -> PostgreSQL (scs_core.inquiries)
```

Published website settings, solutions, partners, projects and insights are read
server-side from `CMS_API_URL`. When that variable is configured, the CMS is
authoritative: empty or unavailable CMS data is not silently replaced by bundled
records. The bundled content remains available only for standalone UI development.

## Local development

Requirements: Node.js 22 and pnpm 10.

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

The website runs at `http://localhost:3000`. Run the separate CMS repository on
`http://localhost:3101`, then set `CMS_API_URL=http://localhost:3101/api` to test
the full content workflow.

## Environment contract

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SERVER_URL` | Canonical public website origin |
| `CMS_API_URL` | Payload REST base URL, including `/api` |
| `CMS_ADMIN_URL` | CMS admin URL used by the preview banner |
| `CMS_PREVIEW_SECRET` | Shared secret for draft preview |
| `CMS_REVALIDATE_SECRET` | Shared secret for publish-time cache invalidation |
| `CORE_API_URL` | Internal Core API origin used by the consultation form |

The public consultation endpoint validates and rate-limits input before sending
it to the Core API. In production the website also joins the internal
`SCS_BACKEND_NETWORK`; the Core API and its database are never exposed directly
to the browser.

Keep both shared secrets server-side and use different random values. The CMS
uses matching values under `WEBSITE_PREVIEW_SECRET` and
`WEBSITE_REVALIDATE_SECRET`.

## Checks

```powershell
pnpm test
pnpm typecheck
pnpm build
```

See [CMS integration](docs/CMS-INTEGRATION.md) for preview, publishing and the
two-repository deployment order.
