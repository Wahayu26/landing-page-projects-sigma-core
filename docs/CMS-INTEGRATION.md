# CMS integration

The website and CMS are separate deployable applications. They share content by
HTTP, not by importing source files and not by connecting both applications to
the same database.

## Data flow

- Public pages read published records from `CMS_API_URL`.
- Payload generates a signed preview link for draft records.
- `/api/preview` enables Next.js Draft Mode after validating
  `CMS_PREVIEW_SECRET`.
- Payload calls `/api/revalidate` after content changes; the endpoint validates
  `CMS_REVALIDATE_SECRET` before invalidating the relevant tag and routes.
- Media URLs remain owned and served by the CMS origin.

## Local ports

- Website: `http://localhost:3000`
- CMS: `http://localhost:3101`

Use the same preview and revalidation secret pairs in both local `.env.local`
files. Never commit their real values.

## Production order

1. Back up the existing PostgreSQL `scs_cms` database and CMS media volume.
2. Deploy this website stack, which creates/uses the shared `scs-edge` network.
3. Deploy the standalone CMS stack on that network using the existing database
   and media volume.
4. Verify the CMS health endpoint and admin login directly.
5. Reload the website reverse proxy and verify both domains.
6. Publish one harmless CMS change and confirm the website cache refreshes.

Do not run destructive database resets during the split. Repository separation
does not require copying production rows: the new CMS service reuses the current
database and media volume.
