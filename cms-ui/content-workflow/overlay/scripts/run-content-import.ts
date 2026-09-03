import { existsSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { getPayload } from 'payload';
import config from '../payload.config';
import { solutions } from '../content/site';
import { websiteSeed } from '../content/website-seed';
import { importContent } from './import-content.mjs';

const source = process.cwd();
if (!source.replaceAll('\\', '/').endsWith('/.rollback/cms-ui-preview') ||
  process.env.PAYLOAD_DB_PROVIDER !== 'sqlite' || process.env.PAYLOAD_SQLITE_URL !== 'file:./.data/cms-ui-preview.db' ||
  process.env.PAYLOAD_DB_PUSH !== 'false') throw new Error('Testing SQLite only.');
const backup = resolve(process.env.CMS_CONTENT_BACKUP || source);
if (!backup.startsWith(resolve(source, '../backups') + sep) || !existsSync(resolve(backup, '.data/cms-ui-preview.db')) ||
  !existsSync(resolve(backup, 'media'))) throw new Error('Database and media backup required.');
const payload = await getPayload({ config });
try {
  // Backfill version history without changing any existing document or timestamp.
  if (process.env.CMS_CONTENT_APPLY === 'true') {
    for (const collection of ['solutions', 'partners', 'projects', 'insights'] as const) {
      const docs = await payload.find({ collection, pagination: false, depth: 0 });
      for (const doc of docs.docs) {
        const versions = await payload.findVersions({ collection, where: { parent: { equals: doc.id } }, limit: 1 });
        if (!versions.totalDocs) {
          await payload.db.createVersion({ collectionSlug: collection, parent: doc.id,
            versionData: doc, createdAt: doc.createdAt, updatedAt: doc.updatedAt, autosave: false });
        }
      }
    }
  }
  const report = await importContent({ payload, solutions, settings: websiteSeed, apply: process.env.CMS_CONTENT_APPLY === 'true' });
  writeFileSync(resolve(backup, `content-${report.mode}-${Date.now()}.json`), JSON.stringify(report, null, 2), { flag: 'wx' });
  console.log(JSON.stringify(report, null, 2));
} finally { await payload.destroy(); }
