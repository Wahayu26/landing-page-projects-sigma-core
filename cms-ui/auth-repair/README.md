# CMS authentication repair

Applied locally to the legacy Payload app at port 3101. Nothing deployed or pushed.

## Causes and changes

- The configured CMS server origin fell back to `http://localhost:3000` while the
  browser used port 3101. Payload includes `serverURL` in its CSRF allowlist, so
  cookie authentication was discarded for preference DELETE and logout POST.
  The repaired origin uses `PAYLOAD_SERVER_URL`, then `NEXT_PUBLIC_SERVER_URL`,
  and is validated as an exact HTTP(S) origin. CSRF protection remains enabled.
- The built-in logout client cleared its in-memory user and reported success even
  when the logout request failed. The custom view checks the response, handles
  already-expired sessions, and only then performs a full navigation to login.
  Network/server errors offer retry rather than a false success.
- The custom dashboard now checks user identity and admin permissions before any
  content reads. Its Local API counts explicitly honor the current user's access.
- Editors can edit their own account, but cannot create/delete accounts or change
  roles. Admins manage users. First-user onboarding initializes an administrator;
  existing users, passwords, roles and content are not rewritten.
- Dashboard “Lihat website” uses the configured frontend URL, so testing does not
  incorrectly open production.

## Apply

After the UI/content/services/navigation patches, from the repository root:

```powershell
node cms-ui/auth-repair/apply.mjs
```

An optional argument selects another legacy Payload checkout. No schema migration
or content import is required. Keep the existing database and Payload secret.
Inside the legacy checkout, with its existing database/secret environment loaded:

```powershell
$env:PAYLOAD_SERVER_URL = 'http://localhost:3101'
$env:NEXT_PUBLIC_SERVER_URL = 'http://localhost:3101'
pnpm cms:importmap
pnpm typecheck
pnpm build
pnpm start --hostname 127.0.0.1 --port 3101
```

For production, the CMS value should be `https://cms.sigmacore.id` and the public
frontend value `https://sigmacore.id`. Rebuild after changing public environment
variables. Do not use wildcards or disable CSRF to fix an origin mismatch.

## Verification

Run unit and public component checks from the root:

```powershell
node --test --test-isolation=none cms-ui/auth-repair/auth.test.mjs scripts/render-public.test.mjs scripts/services.test.mjs
```

`prepare-qa.mjs` creates a consistent SQLite snapshot under the ignored
`.rollback/cms-ui-preview/.data/auth-qa-*` folder with two random disposable account
credentials. `scripts/seed-auth-qa.ts` refuses to run outside that QA database.
`verify-http.mjs` targets only port 3102 with this snapshot. Never run these tests
against the real testing or production database. Stop the QA server after testing.

Verified 23 HTTP assertions: anonymous dashboard redirect/no count disclosure,
incorrect password rejection, admin/editor login, preference save/reset/isolation,
cross-origin rejection, editor role-escalation prevention, logout cookie expiry,
server session revocation/replay rejection, and login again. Browser verification
uses `127.0.0.1:3102` with that exact `PAYLOAD_SERVER_URL` to avoid sharing cookies
with the user's `localhost:3101` session.

Local SMTP remains unconfigured; email/password-reset delivery is not claimed to
work by this patch. No account passwords or live preferences were reset.

References: [Payload cookie authentication](https://payloadcms.com/docs/authentication/cookies),
[custom admin views](https://payloadcms.com/docs/custom-components/custom-views),
and [preferences](https://payloadcms.com/docs/admin/preferences). The implementation
was checked against the installed Payload 3.88.0 and Next.js 16.3.3 sources.
