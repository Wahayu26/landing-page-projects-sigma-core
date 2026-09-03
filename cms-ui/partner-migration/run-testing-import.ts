// Copy together with import-partners.mjs into the isolated CMS preview's scripts/.
// Invoke with `pnpm payload run scripts/run-testing-import.ts`; no production mode.
import { existsSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { getPayload } from 'payload';
import config from '../payload.config';
import { partners } from '../content/site';
import { importPartners } from './import-partners.mjs';

const source = process.cwd();
if (!source.replaceAll('\\', '/').endsWith('/.rollback/cms-ui-preview') ||
    process.env.PAYLOAD_DB_PROVIDER !== 'sqlite' ||
    process.env.PAYLOAD_SQLITE_URL !== 'file:./.data/cms-ui-preview.db' ||
    process.env.PAYLOAD_DB_PUSH !== 'false') {
  throw new Error('Import is restricted to the isolated local CMS testing database.');
}
const backup = resolve(process.env.CMS_PARTNER_BACKUP || source);
if (!backup.startsWith(resolve(source, '../backups') + sep) ||
    !existsSync(resolve(backup, '.data/cms-ui-preview.db')) ||
    !existsSync(resolve(backup, 'media/Dedsec Logo.jpg'))) {
  throw new Error('A database + media backup under .rollback/backups is required.');
}
const payload = await getPayload({ config });
try {
  const report = await importPartners({
    payload, partners, publicDir: resolve(source, 'public'),
    apply: process.env.CMS_PARTNER_IMPORT_APPLY === 'true',
  });
  const name = `${report.mode}-${new Date().toISOString().replaceAll(/[:.]/g, '-')}.json`;
  writeFileSync(resolve(backup, name), JSON.stringify(report, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(report, null, 2));
} finally {
  await payload.destroy();
}
