# CMS content workflow — local testing

Implemented and verified on **2026-09-03** in `.rollback/cms-ui-preview`, served at `http://localhost:3101`. This is the legacy Payload application, not the extracted frontend in `src/`. Nothing here has been deployed to production or pushed to GitHub.

## Imported content

- Six solutions from the existing `content/site.ts`, including features, outcomes, benefits, use cases, categories, icons, order, and original slugs.
- Website settings: hero, contact, company facts, SEO.
- About section; six workflow steps; four company strengths.
- Existing 20 partners, media, account identities and passwords preserved. DedSec was deliberately deleted by the user and was **not** recreated.

Backup: `.rollback/backups/cms-content-before-import-20260903-111632/` contains the database, media, and source from before this migration. Do not commit this directory or any database/account files.

## Editor workflow

1. Open `/admin/collections/solutions` for solutions, or `/admin/globals/site-settings` for website sections.
2. Edit fields and **Simpan Draf**. Required fields must be complete before saving.
3. Click **Pratinjau**. You must be logged into the CMS on the same hostname. A banner identifies preview mode. Save a new draft and reload the preview to see further changes.
4. **Publikasikan perubahan** makes the changes public. For collections, leave **Tampilkan di website** enabled when the item should appear.
5. Use **Keluar preview** to check the public version. Publish/unpublish/delete invalidates CMS data and frontend page caches; a page already open in another tab needs a refresh.

The same draft/version workflow is available to Partners, Projects and Insights. No sample project/article content was invented. A first-time draft remains private. Saving an edit as a draft preserves the currently published version. Slug changes and unpublishing remove the old public URL rather than resurrecting bundled fallback content.

Preview is not an unauthenticated share link. The preview endpoint authenticates the Payload session, allowlists targets, resolves the stored slug, and sets Next Draft Mode. Every draft page authenticates again. Preview cookies alone cannot grant draft access. Preview pages are private/no-store and noindex. The sitemap always reads published content, even in a preview session.

## Implementation

- `overlay/cms/content-workflow.ts`: drafts, bounded version history, access checks, editable sections, revalidation hooks.
- `overlay/lib/cms-content.ts`: public JSON Data Cache (300 seconds as fallback TTL) separated from authenticated uncached draft reads.
- `apply.mjs`: reproducible patch for the legacy CMS, including frontend bindings, favicon, preview banner, sitemap/static params and dashboard published counts. Reapplying is idempotent.
- `import-content.mjs`: add-only solution import matched by slug; settings fill missing fields without overwriting populated values. No runtime fallback to this seed after migration.
- `overlay/cms/migrations/sqlite/20260903_042115_content_workflow.ts`: additive SQLite migration; no table drops or rebuilds. Existing NOT NULL constraints are intentionally retained; draft validation remains enabled. `PAYLOAD_DB_PUSH` must stay `false`.
- `migrate-testing.mjs`: guarded local SQLite migration runner, single transaction with foreign-key validation. Does not rerun historical migrations against the push-created testing database.
- `overlay/scripts/run-content-import.ts`: guarded testing-only importer and initial version-history backfill without changing existing document timestamps.

`prepare-migration.mjs` was a one-time conversion of Payload's generated SQLite SQL into the reviewed additive migration. Do not rerun it against the already-patched file. Review any future generated schema migration manually, particularly nullability/default changes.

## Reapply or reproduce locally

Stop the testing server and take a fresh database + media backup first. From the project root:

```powershell
node cms-ui/content-workflow/apply.mjs
$env:CMS_CONTENT_BACKUP = '<absolute path to fresh backup under .rollback/backups>'
node cms-ui/content-workflow/migrate-testing.mjs
```

Inside `.rollback/cms-ui-preview`, use the existing testing environment: `PAYLOAD_DB_PROVIDER=sqlite`, `PAYLOAD_SQLITE_URL=file:./.data/cms-ui-preview.db`, `PAYLOAD_DB_PUSH=false`, and the **same existing** local Payload secret. Do not replace the secret or switch the database.

```powershell
pnpm payload generate:types
pnpm payload run scripts/run-content-import.ts # dry run by default
$env:CMS_CONTENT_APPLY = 'true'
pnpm payload run scripts/run-content-import.ts
Remove-Item Env:CMS_CONTENT_APPLY
pnpm build
pnpm start --hostname 127.0.0.1 --port 3101
```

The importer preserves matching solution records. It refuses to overwrite a newer editorial settings draft. Backup restoration, if needed, must be done with the server stopped and after preserving any edits made since that backup; automatic down migration is deliberately disabled.

## Verification performed

- TypeScript and production build passed.
- 15 unit tests across UI patches and import helpers passed.
- SQLite integrity and foreign keys passed.
- Before/after verification: 20 original partner records, all 24 existing media files, and account identity/password fields preserved. QA login/logout updates only normal login/session audit fields.
- HTTP end-to-end test passed: six public solutions, authenticated draft preview, cookie-only denial, noindex/private headers, collection and global draft isolation, publish updates, slug changes, unpublish removal, published-only sitemap.
- Test solution was deleted after verification. Original website settings were restored after global publish testing; version history retains that QA audit trail.
- CMS editor visually checked with the migrated fields and native Draft/Preview/Publish controls.

Tests: `node --test cms-ui/content-workflow/import-content.test.mjs cms-ui/apply.test.mjs cms-ui/partner-migration/import-partners.test.mjs`. Read-only preservation check: set `CMS_CONTENT_BACKUP`, then run `node cms-ui/content-workflow/verify-preservation.mjs`. The HTTP workflow test deliberately creates one temporary solution and briefly publishes a QA settings headline; run it **only on isolated testing**, never while somebody is editing settings. Supply the existing scratch test account password as `CMS_QA_PASSWORD`; it is never logged.

## Production is a separate step

This package does not change `cms-ui/Dockerfile`, the production PostgreSQL schema, Cloudflare, Nginx, or the extracted frontend's content source. Production rollout requires a reviewed PostgreSQL migration, deployment/build strategy, and an authenticated cross-app preview/content-cache integration if frontend and CMS remain separate. Do not copy the testing SQLite database or its accounts to production. Existing SMTP localhost warnings are unrelated to this content workflow; email delivery is not configured in testing.

References: [Payload drafts](https://payloadcms.com/docs/versions/drafts), [Payload preview](https://payloadcms.com/docs/admin/preview), [Next.js cache invalidation](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).
