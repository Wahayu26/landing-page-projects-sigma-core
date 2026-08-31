# PT Sigma Core Solusindo - Company Profile Landing Page

Interactive landing-page mockup based on the 2026 company profile. The visual direction combines SCS's dark blue, cyan, and green technology identity with the clean navigation, cinematic hero, pill CTAs, and generous spacing of the supplied Bank Jakarta reference.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Recommended production architecture

- **Public website:** Next.js App Router with Server Components, responsive images, SEO metadata, and ISR where useful.
- **CMS:** Payload CMS inside the same Next.js application, backed by PostgreSQL. Suggested collections: Pages, Solutions, Partners, Articles, Media, Site Settings, and Users.
- **Business backend:** Spring Boot as a separate service only for domain logic, enterprise integrations, quotation workflows, customer portals, or data that should not live in the CMS.
- **Integration:** Next.js reads editorial content directly from Payload. Next.js calls Spring Boot through an internal REST API for business operations. Spring Boot should not become the storage layer for page copy and media.
- **Deployment:** Containerize the Next.js/Payload and Spring Boot services separately, place both behind a reverse proxy, and use object storage for uploaded media.

For a company-profile-only first release, Next.js + Payload + PostgreSQL is enough. Add Spring Boot when there is a real business workflow or external-system integration to own.

## Current prototype scope

- One polished public landing page
- Content kept in `content/site.ts` so the future CMS model is explicit
- Brand imagery and logo extracted from the supplied company-profile PDF
- No CMS admin, authentication, database, or Spring Boot service yet

