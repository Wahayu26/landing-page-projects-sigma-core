// Convert the reviewed generator output to an additive SQLite migration.
// Existing tables/constraints/rows are preserved: validate:true requires complete drafts.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
const generated = resolve('.rollback/cms-ui-preview/cms/migrations/sqlite/20260903_042115_content_workflow.ts');
let source = readFileSync(generated, 'utf8');
if (!source.includes('PRAGMA foreign_keys=OFF')) throw new Error('Expected unmodified generator output');
source = source.slice(0, source.indexOf('  await db.run(sql`PRAGMA foreign_keys=OFF'));
source = source.replace('MigrateUpArgs, MigrateDownArgs, sql', 'MigrateUpArgs, sql');
for (const collection of ['solutions', 'partners', 'projects', 'insights']) {
  source += `  await db.run(sql\`ALTER TABLE ${collection} ADD COLUMN _status text DEFAULT 'draft';\`)\n`;
  source += `  await db.run(sql\`UPDATE ${collection} SET _status = CASE WHEN published = 1 THEN 'published' ELSE 'draft' END;\`)\n`;
  source += `  await db.run(sql\`CREATE INDEX ${collection}__status_idx ON ${collection} (_status);\`)\n`;
}
for (const field of ['about_eyebrow', 'about_headline', 'about_highlight', 'about_description', 'workflow_eyebrow', 'workflow_title', 'workflow_description', 'strengths_eyebrow', 'strengths_title', 'strengths_description']) {
  source += `  await db.run(sql\`ALTER TABLE site_settings ADD COLUMN ${field} text;\`)\n`;
}
source += `  await db.run(sql\`ALTER TABLE site_settings ADD COLUMN _status text DEFAULT 'draft';\`)\n`;
source += `  await db.run(sql\`UPDATE site_settings SET _status = 'published';\`)\n`;
source += `  await db.run(sql\`CREATE INDEX site_settings__status_idx ON site_settings (_status);\`)\n`;
source += `}\n\nexport async function down(): Promise<void> {\n  throw new Error('Restore the pre-migration database backup; automatic rollback would discard editorial versions.');\n}\n`;
const out = resolve('cms-ui/content-workflow/overlay/cms/migrations/sqlite');
mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, '20260903_042115_content_workflow.ts'), source);
copyFileSync(generated.replace('.ts', '.json'), resolve(out, '20260903_042115_content_workflow.json'));
copyFileSync(resolve(generated, '../index.ts'), resolve(out, 'index.ts'));
console.log('Prepared additive migration. No DROP TABLE, DELETE, or table rebuild.');
