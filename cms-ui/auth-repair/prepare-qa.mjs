import { DatabaseSync, backup } from 'node:sqlite';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

// SQLite backup captures an internally consistent snapshot without modifying the source.
const source = resolve('.rollback/cms-ui-preview/.data/cms-ui-preview.db');
const directory = mkdtempSync(resolve('.rollback/cms-ui-preview/.data/auth-qa-'));
const db = new DatabaseSync(source, { readOnly: true });
try { await backup(db, resolve(directory, 'qa.db')); } finally { db.close(); }
const suffix = randomBytes(6).toString('hex');
writeFileSync(resolve(directory, 'accounts.json'), JSON.stringify({
  admin: { name: 'Auth QA Admin', email: `qa-admin-${suffix}@example.test`, password: randomBytes(24).toString('base64url'), role: 'admin' },
  editor: { name: 'Auth QA Editor', email: `qa-editor-${suffix}@example.test`, password: randomBytes(24).toString('base64url'), role: 'editor' },
}), { mode: 0o600 });
console.log(directory);
