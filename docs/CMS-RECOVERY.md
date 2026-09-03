# Recover the existing CMS without rolling back the public website

This is a temporary bridge to the already-created legacy Payload dashboard, not
a deployment of the separate `sigma-core-cms` project. It is specific to the
server topology confirmed on 2026-09-03:

| Host | Destination |
| --- | --- |
| sigmacore.id, www.sigmacore.id | scs-web-web-1:3000 |
| cms.sigmacore.id | scs-company-profile-web-1:3000 |
| mail.sigmacore.id | Existing Zimbra upstream, unchanged |

The live proxy is `scs-company-profile-proxy-1`. It already shares
`scs-web_frontend` with the public app and `scs-company-profile_frontend` with the
legacy CMS. Its configuration is a read-only file bind mount from
`/opt/scs-company-profile/source/infra/nginx/default.conf`. The existing certificate
includes all four hostnames. The old CMS container is stopped and uses
`scs/web:20260901-2`; its health and admin route still need runtime verification.

## Recovery order

1. Keep the existing CMS container, image, database, secrets, media volumes and
   `/opt/scs-company-profile/legacy-server-files` backup. Do not recreate the
   container, run migrations, delete volumes or run `down --remove-orphans`.
2. Back up the live configuration outside the repository and outside Nginx's
   `*.conf` include directory. Record the backup path.
3. Install the updated `infra/nginx/default.conf`. It explicitly selects the new
   public container, restoring a CMS virtual host that forwards all paths to the
   old app and redirects only `/` to `/admin`. Do not replace that CMS target with
   the ambiguous Docker alias `web`.
4. Verify the file visible inside the proxy matches the host file. File bind
   mounts can retain an old inode after an editor or Git replaces the host file.
   If they differ, stop here: do not start the CMS or reload a stale configuration.
5. Validate and reload the live proxy BEFORE starting the old CMS:

   ```bash
   docker exec scs-company-profile-proxy-1 nginx -t && docker exec scs-company-profile-proxy-1 nginx -s reload
   ```

   CMS DNS is resolved at request time. A stopped CMS may return 502 on its own
   subdomain but will not cause Nginx config validation to fail. No proxy restart
   or new image build is required. Verify the public site still works.
6. Start the existing CMS container:

   ```bash
   docker start scs-company-profile-web-1
   docker logs --tail=80 scs-company-profile-web-1
   ```

   Startup success and a healthy home page alone do not prove the admin works.
   Wait for the app to be ready, then test the admin route and login. If it fails,
   inspect logs and the existing database/media mounts; do not create a fresh
   database or change secrets to force startup. Redact secrets before sharing logs.

## Verify origin and public access

Run these on the server; `--resolve` targets the origin while retaining TLS
hostname verification and the correct Host header. Do not use `-k`.

```bash
curl --resolve sigmacore.id:443:127.0.0.1 -I https://sigmacore.id/
curl --resolve cms.sigmacore.id:443:127.0.0.1 -I https://cms.sigmacore.id/
curl --resolve cms.sigmacore.id:443:127.0.0.1 -I https://cms.sigmacore.id/admin
curl --resolve cms.sigmacore.id:443:127.0.0.1 -I https://cms.sigmacore.id/admin/login
curl --resolve mail.sigmacore.id:443:127.0.0.1 -I https://mail.sigmacore.id/
curl -I https://cms.sigmacore.id/admin
```

The CMS root should redirect to `/admin`. Admin should render or redirect to
authentication, not return the landing page or a 404/502. Verify login, assets,
existing content and media in a browser. If a first-user setup page unexpectedly
appears, stop and check the database connection instead of registering a new user.
If origin works but public access fails, investigate Cloudflare routing/cache
rules separately. CMS/API responses must not be put behind a Cache Everything rule.

Restoring this admin does NOT wire the new public website to CMS content. The
current frontend still reads `src/content/site.ts` via `src/lib/landing-content.ts`.

## Rollback

If validation fails, do not reload. Restore the backed-up config, confirm it is
visible inside the proxy, and re-run `nginx -t`. If rolling back after starting
the CMS, stop `scs-company-profile-web-1` first; the old config's `web` alias can
otherwise resolve to either app. Reload only after validation succeeds. Leave
the public app, Core API, PostgreSQL and Zimbra running.

## Subsequent deployments

Do not run `scripts/deploy-production.sh` blindly on this mixed-stack server:
it would attempt to start another proxy on ports already owned by the legacy one.
For a planned replacement proxy, use both Compose files:

```bash
docker compose --env-file .env.production -f compose.prod.yaml -f compose.cms-legacy.yaml config --quiet
```

The overlay declares the external legacy CMS network for the new proxy. It does
not start the legacy CMS or transfer port ownership; those require a planned
cutover. Keep the default Compose project name `scs-web`, as the public upstream
uses its confirmed container name. The current manual Core API network attachment
also needs to be preserved when replacing the web container.

Replace this bridge with the separate CMS service only after its database,
uploads, environment, authentication, network and backups are verified. Update
the upstream and network declaration together; do not delete the legacy resources
until migration has been validated.
