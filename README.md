# PT Sigma Core Solusindo — Company Profile Platform

Company-profile landing page with a production-oriented split between editorial content and business workflows.

## Architecture

```text
Browser
  └─ Next.js 16
      ├─ Public landing page
      ├─ Payload CMS admin + editorial API
      └─ /api/inquiries (BFF proxy)
             └─ Spring Boot core API
                    └─ PostgreSQL: scs_core

Payload CMS ──────────────────── PostgreSQL: scs_cms
```

- **Next.js:** public UI, SEO, image optimization, server rendering, and the browser-facing API boundary.
- **Payload CMS:** runs inside the Next.js application at `/admin`; owns solutions, partners, projects, insights, media, site settings, and editor accounts.
- **Spring Boot:** separate service for business data and integrations. The first implemented workflow is a trackable consultation inquiry.
- **PostgreSQL:** separate logical databases for CMS content (`scs_cms`) and core business data (`scs_core`).

The landing page reads published solutions, partners, projects, insights, hero copy, contact details, and SEO metadata from Payload every five minutes. Bundled company-profile data remains as a safe fallback while the CMS is empty or unavailable.

## Run the website and CMS

Requirements: Node.js 20+ and pnpm.

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm payload migrate
pnpm dev
```

Open:

- Landing page: `http://localhost:3000`
- CMS admin: `http://localhost:3000/admin`
- CMS REST API: `http://localhost:3000/api/solutions`

The branded CMS dashboard provides publication counts, a website-readiness checklist, quick-create actions, and direct access to global website settings. Project and insight sections are automatically hidden on the landing page until published content exists.

The first visit to `/admin` creates the first administrator. Local development defaults to SQLite in `.data/payload.db`, so Docker is not required for frontend/CMS work.

## Run the Spring Boot core API

Requirements: Java 21, Maven 3.9+, and PostgreSQL.

Start the prepared PostgreSQL databases (optional Docker workflow):

```powershell
docker compose up -d postgres
```

Then start the API:

```powershell
Set-Location services/core-api
mvn spring-boot:run
```

Endpoints:

- `POST /api/v1/inquiries` — stores a consultation request and returns its public reference.
- `GET /api/v1/inquiries/{reference}` — returns only receipt/status data.
- `GET /actuator/health` — runtime health check.

Run backend tests with `mvn test` from `services/core-api`.

## PostgreSQL CMS mode

Set these values in `.env.local`:

```dotenv
PAYLOAD_DB_PROVIDER=postgres
DATABASE_URL=postgresql://scs:scs@localhost:5432/scs_cms
```

Schema push is opt-in through `PAYLOAD_DB_PUSH=true` and should only be used against a disposable development database. For persistent databases, create and commit migrations against a development PostgreSQL instance:

```powershell
pnpm payload migrate:create initial_cms
pnpm payload migrate
```

SQLite and PostgreSQL migrations are intentionally kept in separate directories under `cms/migrations`.

## Useful commands

```powershell
pnpm typecheck
pnpm build
pnpm cms:types
pnpm cms:importmap
```

Uploaded CMS media is written to `public/media` for local development. Production should replace local media storage with S3-compatible object storage and use a long, secret `PAYLOAD_SECRET`.

## Production deployment

The repository includes a Docker Compose production stack for Next.js/Payload CMS, Spring Boot, PostgreSQL, and Nginx. Follow [the Rocky Linux deployment guide](docs/DEPLOYMENT-ROCKY-LINUX.md) for the prepared UAT server workflow, health checks, backups, and rollback.
