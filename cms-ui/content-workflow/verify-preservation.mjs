import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { resolve } from 'node:path';
const backup = resolve(process.env.CMS_CONTENT_BACKUP);
const before = new DatabaseSync(resolve(backup, '.data/cms-ui-preview.db'), { readOnly: true });
const after = new DatabaseSync('.rollback/cms-ui-preview/.data/cms-ui-preview.db', { readOnly: true });
try {
  for (const table of ['partners', 'media', 'users']) {
    const columns = before.prepare(`PRAGMA table_info("${table}")`).all().filter(x => table !== 'users' || !['updated_at', 'login_attempts', 'lock_until'].includes(x.name)).map(x => `"${x.name}"`).join(',');
    // Login/logout legitimately updates account audit fields. Never print hashes,
    // salts, or reset tokens in an assertion diff if this check fails.
    assert.ok(isDeepStrictEqual(after.prepare(`SELECT ${columns} FROM "${table}" ORDER BY id`).all(), before.prepare(`SELECT ${columns} FROM "${table}" ORDER BY id`).all()), `${table} content differs from backup`);
  }
  const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
  const media = readdirSync(resolve(backup, 'media'));
  for (const file of media) assert.equal(digest(resolve('.rollback/cms-ui-preview/public/media', file)), digest(resolve(backup, 'media', file)), file);
  assert.equal(after.prepare("SELECT count(*) AS n FROM solutions WHERE _status='published' AND published=1").get().n, 6);
  assert.equal(after.prepare('SELECT count(*) AS n FROM site_settings_workflow_steps').get().n, 6);
  assert.equal(after.prepare('SELECT count(*) AS n FROM site_settings_strengths_items').get().n, 4);
  assert.equal(after.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  assert.equal(after.prepare('PRAGMA foreign_key_check').all().length, 0);
  console.log(JSON.stringify({ partnersPreserved: before.prepare('SELECT count(*) AS n FROM partners').get().n, usersPreserved: true, mediaFilesUnchanged: media.length, publishedSolutions: 6, workflowSteps: 6, strengths: 4, databaseIntegrity: 'ok' }));
} finally { before.close(); after.close(); }
