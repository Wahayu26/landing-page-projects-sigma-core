// Run while port 3101 is stopped. Additive migration in one SQLite transaction.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
const project = resolve('.');
const backup = resolve(process.env.CMS_CONTENT_BACKUP || '.');
const database = resolve(project, '.rollback/cms-ui-preview/.data/cms-ui-preview.db');
if (!backup.startsWith(resolve(project, '.rollback/backups') + sep) || !existsSync(resolve(backup, '.data/cms-ui-preview.db'))) throw new Error('Backup required');
const migration = '20260903_042115_content_workflow';
const source = readFileSync(resolve(project, `cms-ui/content-workflow/overlay/cms/migrations/sqlite/${migration}.ts`), 'utf8');
const up = source.split('export async function down')[0];
const statements = [...up.matchAll(/db\.run\(sql`((?:\\.|[^`])*)`\)/g)].map(match => match[1].replaceAll('\\`', '`'));
if (statements.length < 50 || statements.some(sql => /\b(DROP|DELETE|PRAGMA|RENAME)\b/i.test(sql.replaceAll(/ON DELETE (cascade|set null)/gi, '')))) throw new Error('Migration is not additive');
const db = new DatabaseSync(database);
try {
  if (db.prepare('SELECT id FROM payload_migrations WHERE name = ?').get(migration)) {
    console.log('Schema already migrated; skipped.');
  } else {
    db.exec('PRAGMA foreign_keys = ON; BEGIN IMMEDIATE;');
    try {
      for (const statement of statements) db.exec(statement);
      if (db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Foreign key validation failed');
      db.prepare('INSERT INTO payload_migrations (name, batch, updated_at, created_at) VALUES (?, 1, ?, ?)').run(migration, new Date().toISOString(), new Date().toISOString());
      db.exec('COMMIT');
      console.log(`Applied ${statements.length} additive statements; foreign keys OK.`);
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
} finally { db.close(); }
