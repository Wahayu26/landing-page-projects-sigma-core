import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./apply.mjs', import.meta.url));
const baseline = `export default {
  admin: {
    components: {
      graphics: { Icon: "/cms/components/AdminIcon" },
    },
    meta: { titleSuffix: "— Sigma Core CMS", },
  },
  db: existingDatabaseAdapter,
  collections: [Users, Media, Insights],
  secret: process.env.PAYLOAD_SECRET,
};`;
function fixture(t, config = baseline) {
  const root = mkdtempSync(join(tmpdir(), 'scs-ui-patch-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'cms/components'), { recursive: true });
  writeFileSync(join(root, 'payload.config.ts'), config);
  writeFileSync(join(root, 'cms/components/AdminDashboard.tsx'), '<Link href="/" target="_blank">Lihat website</Link>');
  return root;
}
test('patches branding and theme files, preserving backend configuration', (t) => {
  const root = fixture(t);
  execFileSync(process.execPath, [script, root]);
  const config = readFileSync(join(root, 'payload.config.ts'), 'utf8');
  assert.match(config, /beforeNavLinks: \["\/cms\/components\/AdminLogo"\]/);
  assert.match(config, /scs-icon\.png\?v=cms-ui-1/);
  assert.match(config, /db: existingDatabaseAdapter/);
  assert.match(config, /collections: \[Users, Media, Insights\]/);
  assert.match(config, /secret: process\.env\.PAYLOAD_SECRET/);
  assert.match(readFileSync(join(root, 'cms/components/AdminDashboard.tsx'), 'utf8'), /https:\/\/sigmacore\.id\//);
  assert.ok(readFileSync(join(root, 'public/assets/scs-icon.png')).equals(readFileSync(new URL('./overlay/public/assets/scs-icon.png', import.meta.url))));
});
test('applying twice is idempotent, including CRLF input', (t) => {
  const root = fixture(t, baseline.replaceAll('\n', '\r\n'));
  execFileSync(process.execPath, [script, root]);
  const first = readFileSync(join(root, 'payload.config.ts'), 'utf8');
  execFileSync(process.execPath, [script, root]);
  assert.equal(readFileSync(join(root, 'payload.config.ts'), 'utf8'), first);
  assert.equal(first.match(/beforeNavLinks/g)?.length, 1);
});
test('rejects incompatible CMS before changing files', (t) => {
  const original = 'export default { admin: { components: {} } };';
  const root = fixture(t, original);
  assert.notEqual(spawnSync(process.execPath, [script, root]).status, 0);
  assert.equal(readFileSync(join(root, 'payload.config.ts'), 'utf8'), original);
  assert.equal(existsSync(join(root, 'app/(payload)/custom.scss')), false);
});
test('does not apply to the extracted frontend', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'scs-ui-patch-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.notEqual(spawnSync(process.execPath, [script, root]).status, 0);
  assert.equal(existsSync(join(root, 'payload.config.ts')), false);
});
