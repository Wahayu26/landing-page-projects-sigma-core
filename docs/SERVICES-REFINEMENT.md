# Landing Page — Services refinement (2026-09-03)

## Audit and scope

The supplied prompt's logical ownership fits the project. Its physical paths refer
to an older combined application, however. The current root is the extracted
Next.js public frontend in `src/app`, not `src/app/(frontend)`. The live local
CMS-backed testing application is `.rollback/cms-ui-preview`, with route groups
`app/(frontend)` and `app/(payload)`. Reproducible patches are kept in `cms-ui/`;
the ignored testing copy and database must not be mistaken for committed source.

`solutions` already represents Services: six migrated services, categories,
icons, summaries, capabilities, benefits, use cases, optional rich content/media,
partner relationships and public detail pages. Its existing Payload Admin CRUD,
draft–preview–publish, access checks and testing cache hooks remain unchanged.
No duplicate `services` collection, generated type/import map edit, account change,
new migration, database coupling, Core API change or infrastructure change is part
of this refinement. Existing unrelated working-tree changes were preserved.

## Changes by application

| Boundary | Result |
| --- | --- |
| Public Next.js frontend | Shared server-rendered Solutions section, responsive headings/cards, visible detail links, keyboard focus and empty state; system typography matching sigmacore.id; small-screen solution detail wrapping. Optional published-Solutions REST adapter added to existing content loader. |
| Core API | Unchanged. Not used as a proxy for editorial data. |
| Payload Admin | Existing CRUD, branding and themes retained. No new admin UI. |
| Payload backend | Existing Solutions schema, published-access rules, media and publishing hooks retained. No data writes or reseeding. |

### Files created

- `src/components/SolutionsSection.tsx`: view-model-only Server Component.
- `src/app/services-refinement.css`: public typography, cards, focus and small-screen details.
- `src/lib/cms-solutions.ts`: REST response validation, pagination, publishing filters,
  deterministic sorting, media paths and mapping into presentation values.
- `cms-ui/services-refinement/apply.mjs`: idempotent, public-presentation-only patch for the testing app.
- `scripts/services.test.mjs`, `scripts/render-public.test.mjs`: data adapter and actual component-rendering tests; no DB writes.
- This report.

### Files updated

- `src/app/page.tsx`: replaces inline Services with the shared section.
- `src/app/layout.tsx`: imports the public-only refinement stylesheet.
- `src/components/SectionHeading.tsx`: reuses existing responsive CSS instead of a fixed two-column utility grid; optional heading ID.
- `src/lib/landing-content.ts`: optional server-only CMS source for Solutions; shared by home, navigation, detail pages and sitemap.
- `src/components/RichContent.tsx`: replaces the empty placeholder with escaped standard Lexical text, heading, list, quote, link and media rendering. The testing app retains Payload's native renderer.
- `src/app/solusi/[slug]/page.tsx`: CMS media handling. CMS images are served directly from the configured CMS URL; private-IP image optimization is not enabled.
- `tsconfig.json`: checks the extracted application's source, not separate Payload patch trees.
- `.env.example`, `README.md`: document the actual boundary and optional API configuration.

In testing, the patch copies the two shared components and CSS, then changes only
the frontend page/layout imports. It does not overwrite the CMS content loader,
editable sections, publishing hooks, database or uploaded media.

## Content source and caching

Root frontend flow:

```text
Published Payload REST /api/solutions
  -> src/lib/landing-content.ts + cms-solutions.ts
  -> SolutionView[]
  -> home / navigation / details / sitemap
```

Set `CMS_API_URL` to the API base **including `/api`**, reachable by Next.js and
by the browser for uploaded media. For local integration use
`http://localhost:3101/api`. There is no admin API key or forwarded session cookie.

- **Unset/empty `CMS_API_URL`:** existing bundled six-solution demo mode.
- **Configured CMS:** only `published=true` AND `_status=published`, `draft=false`.
  Pagination and sorting are handled server-side. Empty stays empty with a contact
  option; missing detail pages return 404. Hidden records are never supplemented
  with bundled entries.
- **CMS unavailable/malformed:** explicit error, not silent demo substitution. A
  cold CMS-connected build requires a working API. Next's previously successful
  ISR page can remain available while revalidation fails.
- **Root cache:** 60-second revalidation. Updates are request-driven and may first
  serve the previous cached page while refreshing; not a guaranteed 60-second push.
  Use consistent `CMS_API_URL` at build and runtime. Changing source mode requires
  rebuilding to avoid serving pages generated from the previous source.
- **Testing at 3101:** keeps its existing authenticated preview and publish hooks,
  which invalidate its own data/page caches. Refresh an already-open page after
  publishing. This is separate from the root application's timed REST cache.

Root integration is intentionally **Solutions only**, per this prompt. Other
root content is still bundled. Testing at 3101 remains fully CMS-backed for the
previously migrated partners/settings/About/Workflow/Strengths.

## Reapply the public testing patch

From the repository root:

```powershell
node cms-ui/services-refinement/apply.mjs
```

Then rebuild/restart the existing testing app using its existing local Payload
secret, `PAYLOAD_DB_PROVIDER=sqlite`,
`PAYLOAD_SQLITE_URL=file:./.data/cms-ui-preview.db`, `PAYLOAD_DB_PUSH=false`, and
`NEXT_PUBLIC_SERVER_URL=http://localhost:3101`. Do not rerun the old imports,
replace secrets, reset the database, or copy test accounts into production.

## Checks and remaining rollout work

The implementation was checked with root `pnpm typecheck`, builds in standalone
and CMS-connected mode, the legacy CMS production build, and unit/render tests:

```powershell
# Node 24 used locally; no subprocess test isolation needed on restricted Windows.
node --test --test-isolation=none scripts/services.test.mjs scripts/render-public.test.mjs
```

Browser verification covers Services at desktop/tablet/mobile widths, keyboard
focus, actual system-font comparison, and detail navigation. HTTP checks exercise
all six detail URLs, home, sitemap and a missing-solution 404. Build-time SMTP
`ECONNREFUSED 127.0.0.1:587` warnings in testing are pre-existing; email delivery
is not configured and was not claimed working.

Final results: **14/14 unit/render tests passed**, root and testing typechecks
passed, root builds passed in both standalone and CMS-connected modes, and the
testing production build passed. Scoped ESLint (`src`, the two new test files and
the public patch script) passed. Services grids were checked at 1440, 768, 390
and 320 CSS pixels; the long solution-detail title was checked at 320 without
horizontal overflow. Testing still serves six published solutions, twenty
published partners, and the existing `sales@sigmacore.id` contact. The CMS browser
session required login again, so authenticated dashboard interactions were not
retested in this refinement. Database records were not changed.

Before production rollout: review the existing PostgreSQL publishing migration
and cross-app preview/cache invalidation strategy, configure a browser-reachable
CMS API URL, and deploy the public/CMS applications in coordination. Root contact
submission remains disabled pending an explicit Core API integration task.
Advanced custom Lexical blocks would need corresponding public converters if
introduced later; none were added here. No Git push or production deployment was
performed by this task.
