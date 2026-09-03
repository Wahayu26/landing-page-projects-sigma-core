import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const preview = resolve(root, '.rollback/cms-ui-preview');
const backup = resolve(process.argv[2]);
const before = new DatabaseSync(resolve(backup, '.data/cms-ui-preview.db'), { readOnly: true });
const after = new DatabaseSync(resolve(preview, '.data/cms-ui-preview.db'), { readOnly: true });
const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');
try {
  const tables = before.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  let unchangedTables = 0;
  for (const table of tables) {
    if (['partners', 'media', 'sqlite_sequence'].includes(table)) continue;
    assert.match(table, /^[a-zA-Z0-9_]+$/);
    const query = `SELECT * FROM [${table}] ORDER BY rowid`;
    assert.equal(hash(JSON.stringify(after.prepare(query).all())), hash(JSON.stringify(before.prepare(query).all())), `Unrelated table changed: ${table}`);
    unchangedTables++;
  }
  for (const row of before.prepare('SELECT * FROM media').all()) {
    assert.deepEqual(after.prepare('SELECT * FROM media WHERE id=?').get(row.id), row);
  }
  for (const file of readdirSync(resolve(backup, 'media'))) {
    assert.equal(hash(readFileSync(resolve(preview, 'public/media', file))), hash(readFileSync(resolve(backup, 'media', file))), `Existing media file changed: ${file}`);
  }
  const partners = after.prepare('SELECT id,name,logo_id,published,[order] FROM partners ORDER BY [order]').all();
  assert.equal(partners.length, 21);
  assert.equal(new Set(partners.map(p => p.name.trim().toLowerCase())).size, 21);
  assert.ok(partners.every(p => p.published === 1));
  assert.equal(partners.find(p => p.name === 'DedSec').logo_id, 1);
  console.log(JSON.stringify({ partnerCount: 21, publishedCount: 21, unchangedTables, existingMediaUnchanged: true, partners }, null, 2));
} finally { before.close(); after.close(); }
