# Rollback plan — content architecture rollout

Baseline source and local CMS database were copied before this rollout to a durable workspace archive:

`.rollback/scs-intikom-baseline-20260901.zip`

An additional working copy is available for the current session at:

`C:\Users\WahyuSatria.Aji\AppData\Local\Temp\scs-intikom-rollout-20260901-rollback`

The backup includes `app`, `cms`, `components`, `content`, `lib`, `services`, primary configuration files, and `.data/payload.db`.

## Checkpoint scope

1. Solution detail routes and compact mega menu.
2. CMS company facts and solution detail fields.
3. Project listing/detail and case-study fields.
4. Insight listing/detail and per-record SEO.
5. Inquiry context tracking in Next.js and Spring Boot.
6. Social preview metadata and `public/og.png`.

## Safe rollback procedure

Do not use `git reset --hard` because the repository already contained uncommitted work before this rollout.

1. Stop the Next.js and Spring Boot processes.
2. Move the new files listed below into a recoverable archive outside the repository.
3. Restore only the modified paths from the baseline backup.
4. For the local SQLite CMS, either run the latest Payload `migrate:down` or restore the backed-up `.data/payload.db` while the application is stopped.
5. For a deployed Spring Boot database, review and execute `services/core-api/src/main/resources/db/rollback/U2__remove_inquiry_context.sql` in a maintenance window.
6. Run the Next.js production build and the Spring Boot test suite before starting services again.

## New paths to archive during a full rollback

- `app/(frontend)/solusi`
- `app/(frontend)/proyek`
- `app/(frontend)/insight`
- `app/(frontend)/sitemap.ts`
- `app/(frontend)/not-found.tsx`
- `components/site-header.tsx`
- `components/site-footer.tsx`
- `components/rich-content.tsx`
- `public/og.png`
- `cms/migrations/sqlite/20260901_042625_cms_detail_content.ts`
- `cms/migrations/sqlite/20260901_042625_cms_detail_content.json`
- `services/core-api/src/main/resources/db/migration/V2__add_inquiry_context.sql`
- `services/core-api/src/main/resources/db/rollback/U2__remove_inquiry_context.sql`

## Modified paths restored from baseline backup

- `app/(frontend)/page.tsx`
- `app/(frontend)/layout.tsx`
- `app/(frontend)/globals.css`
- `components/contact-form.tsx`
- `content/site.ts`
- `lib/landing-content.ts`
- `cms/collections/Solutions.ts`
- `cms/collections/Projects.ts`
- `cms/collections/Insights.ts`
- `cms/globals/SiteSettings.ts`
- `cms/migrations/sqlite/index.ts`
- `payload-types.ts`
- `services/core-api/src/main/java/id/sigmacore/coreapi/inquiry/CreateInquiryRequest.java`
- `services/core-api/src/main/java/id/sigmacore/coreapi/inquiry/Inquiry.java`
- `services/core-api/src/main/java/id/sigmacore/coreapi/inquiry/InquiryService.java`
- `services/core-api/src/test/java/id/sigmacore/coreapi/inquiry/InquiryServiceTest.java`

Perform rollback only after confirming the exact target environment and taking a fresh database backup.
