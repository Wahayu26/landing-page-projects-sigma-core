# Project Structure

Dokumen ini menjelaskan struktur teknis PT Sigma Core Solusindo Company Profile Platform dan menjadi acuan penempatan kode baru.

## Architecture overview

```text
Browser
  |
  v
Next.js 16 + React 19
  |-- Public website (App Router)
  |-- Payload CMS admin and editorial API
  `-- /api/inquiries (browser-facing API boundary)
          |
          v
      Spring Boot core API
          |
          v
      PostgreSQL: scs_core

Payload CMS
  |
  `-- PostgreSQL: scs_cms
      or SQLite for local development
```

The Next.js application owns presentation, SEO, content delivery, and the browser-facing API. Payload owns editorial content. Spring Boot owns business workflows and business data.

## Repository tree

```text
.
|-- src/
|   |-- app/
|   |   |-- (frontend)/
|   |   |   |-- api/inquiries/route.ts
|   |   |   |-- insight/
|   |   |   |-- proyek/
|   |   |   |-- solusi/[slug]/
|   |   |   |-- globals.css
|   |   |   |-- layout.tsx
|   |   |   |-- not-found.tsx
|   |   |   |-- page.tsx
|   |   |   `-- sitemap.ts
|   |   `-- (payload)/
|   |       |-- admin/[[...segments]]/
|   |       |-- api/[...slug]/
|   |       |-- custom.scss
|   |       `-- layout.tsx
|   |-- cms/
|   |   |-- collections/
|   |   |-- components/
|   |   |-- globals/
|   |   |-- migrations/
|   |   `-- access.ts
|   |-- components/
|   |-- content/
|   |-- lib/
|   `-- payload-types.ts
|-- public/
|   |-- assets/
|   |-- media/
|   `-- og.png
|-- services/
|   `-- core-api/
|       `-- src/
|           |-- main/java/id/sigmacore/coreapi/
|           |-- main/resources/
|           `-- test/
|-- infra/
|   |-- nginx/
|   `-- postgres/
|-- scripts/
|-- docs/
|-- payload.config.ts
|-- next.config.ts
|-- tsconfig.json
|-- compose.yaml
|-- compose.prod.yaml
`-- Dockerfile
```

## Next.js application

Application source lives under `src/`. Configuration, environment files, package metadata, and static assets remain at the repository root. The `@/` TypeScript alias resolves to `src/`.

### `src/app/(frontend)`

Public App Router surface:

| Path | Responsibility |
| --- | --- |
| `page.tsx` | Company-profile landing page |
| `solusi/[slug]/page.tsx` | Solution detail pages |
| `proyek/page.tsx` | Project listing |
| `proyek/[slug]/page.tsx` | Project detail pages |
| `insight/page.tsx` | Insight listing |
| `insight/[slug]/page.tsx` | Insight detail pages |
| `api/inquiries/route.ts` | Validates and forwards consultation requests to the core API |
| `sitemap.ts` | Dynamic sitemap metadata |
| `layout.tsx` | Public HTML shell and default metadata |
| `globals.css` | Shared public-site design tokens and styling |

The `(frontend)` route group does not appear in URLs. Public pages remain Server Components unless browser state or browser APIs are required.

### `src/app/(payload)`

Payload CMS surface:

| Path | Responsibility |
| --- | --- |
| `admin/[[...segments]]/page.tsx` | Payload admin routes under `/admin` |
| `api/[...slug]/route.ts` | Payload REST and GraphQL endpoints |
| `admin/importMap.js` | Generated Payload admin component map |
| `custom.scss` | Payload admin theme |
| `layout.tsx` | Payload-specific root layout |

The generated `admin/importMap.js` file should be updated with `pnpm cms:importmap`, not edited manually.

## Shared frontend modules

| Directory | Responsibility |
| --- | --- |
| `src/components` | Shared UI used across multiple public routes |
| `src/content` | Static fallback content, navigation, and presentation constants |
| `src/lib` | Server-only content loading and mapping from Payload records to UI view models |
| `src/payload-types.ts` | Generated Payload collection and global types |

Run `pnpm cms:types` after changing Payload schemas. Do not manually edit `src/payload-types.ts`.

## Payload CMS

`payload.config.ts` remains at the repository root because it is application configuration. Payload implementation code lives in `src/cms`:

| Directory | Responsibility |
| --- | --- |
| `collections` | Users, media, solutions, partners, projects, and insights schemas |
| `globals` | Singleton website settings |
| `components` | Branded admin dashboard and admin UI components |
| `migrations/sqlite` | Local-development SQLite migrations |
| `migrations/postgres` | Persistent PostgreSQL migrations |
| `access.ts` | Shared access-control policies |

Published website content is read through `src/lib/landing-content.ts`. Static content in `src/content/site.ts` is used when Payload is empty or unavailable.

## Spring Boot core API

`services/core-api` is an independent Java 21 application. Its inquiry module follows a feature-oriented package structure:

```text
inquiry/
|-- InquiryController.java       HTTP boundary
|-- InquiryService.java          Business logic
|-- InquiryRepository.java       Persistence boundary
|-- Inquiry.java                 JPA entity
|-- CreateInquiryRequest.java    Validated input contract
|-- InquiryReceiptResponse.java  Public output contract
|-- InquiryStatus.java           Workflow status
`-- InquiryNotFoundException.java
```

Flyway migrations live in `src/main/resources/db/migration`. The core API owns the `scs_core` database and must not read or write Payload CMS tables.

## Infrastructure and operations

| Path | Responsibility |
| --- | --- |
| `compose.yaml` | Local supporting services |
| `compose.prod.yaml` | Production service composition |
| `Dockerfile` | Next.js and Payload application image |
| `services/core-api/Dockerfile` | Spring Boot application image |
| `infra/nginx` | Reverse-proxy configuration |
| `infra/postgres` | Database initialization |
| `scripts/deploy-production.sh` | Production deployment workflow |
| `scripts/backup-production.sh` | Production backup workflow |

## Placement rules

- Add URL routes, layouts, route handlers, and metadata inside the appropriate `src/app` route group.
- Add reusable public UI to `src/components`; keep route-specific UI beside its route when it is not shared.
- Add server-side data access and record mapping to `src/lib`.
- Add editorial schemas and admin customization to `src/cms`.
- Add business workflows and persistent business rules to `services/core-api`.
- Keep public assets in `public`; local Payload uploads belong in `public/media`.
- Keep secrets in local environment files and update the matching `.env.example` when adding a new environment key.
- Regenerate Payload types and the import map after CMS schema or admin-component changes.

## Main development checks

```powershell
pnpm typecheck
pnpm cms:types
pnpm cms:importmap
pnpm build
```

Run Spring Boot tests independently from `services/core-api` with `mvn test`.
