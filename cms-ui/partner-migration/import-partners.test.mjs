import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { importPartners } from './import-partners.mjs';
import { cmsMediaUrl } from './cms-media-url.ts';

function fixture(t, existing = []) {
  const publicDir = mkdtempSync(join(tmpdir(), 'scs-partners-test-'));
  t.after(() => rmSync(publicDir, { recursive: true, force: true }));
  mkdirSync(join(publicDir, 'assets/partners'), { recursive: true });
  mkdirSync(join(publicDir, 'media'));
  writeFileSync(join(publicDir, 'assets/partners/hpe.png'), 'hpe-logo');
  writeFileSync(join(publicDir, 'media/Dedsec Logo.jpg'), 'user-upload');
  const data = { partners: structuredClone(existing), media: [{ id: 1, filename: 'Dedsec Logo.jpg' }] };
  let calls = 0;
  const payload = {
    async find({ collection }) { return { docs: structuredClone(data[collection]), totalDocs: data[collection].length }; },
    async create({ collection, data: fields, filePath }) {
      calls++;
      const doc = { id: 100 + calls, ...fields };
      if (filePath) { doc.filename = basename(filePath); copyFileSync(filePath, join(publicDir, 'media', doc.filename)); }
      data[collection].push(doc);
      return structuredClone(doc);
    },
  };
  return { publicDir, payload, data, calls: () => calls, partners: [{ name: 'HPE', logo: '/assets/partners/hpe.png' }] };
}
test('dry-run validates assets and previews both legacy and DedSec without writes', async (t) => {
  const f = fixture(t);
  const report = await importPartners(f);
  assert.deepEqual(report.planned.map(p => p.name), ['HPE', 'DedSec']);
  assert.equal(f.calls(), 0);
});
test('adds missing partners and reuses DedSec upload; second run creates nothing', async (t) => {
  const f = fixture(t);
  const first = await importPartners({ ...f, apply: true });
  assert.equal(first.after, 2);
  assert.equal(first.mediaCreated.length, 1);
  assert.equal(f.data.partners.find(p => p.name === 'DedSec').logo, 1);
  assert.ok(f.data.partners.every(p => p.published === true));
  const calls = f.calls();
  const second = await importPartners({ ...f, apply: true });
  assert.equal(second.created.length, 0);
  assert.equal(f.calls(), calls);
});
test('preserves existing partner fields, including draft status and custom ordering', async (t) => {
  const original = [{ id: 5, name: ' hPe ', logo: 77, order: 99, published: false }, { id: 9, name: 'DedSec', logo: 1, order: 0, published: true }];
  const f = fixture(t, original);
  await importPartners({ ...f, apply: true });
  assert.deepEqual(f.data.partners, original);
  assert.equal(f.calls(), 0);
});
test('missing asset aborts preflight before any write', async (t) => {
  const f = fixture(t);
  f.partners.push({ name: 'Missing', logo: '/assets/partners/missing.png' });
  await assert.rejects(importPartners({ ...f, apply: true }));
  assert.equal(f.calls(), 0);
});
test('existing identical upload is reused when resuming a partial import', async (t) => {
  const f = fixture(t);
  copyFileSync(join(f.publicDir, 'assets/partners/hpe.png'), join(f.publicDir, 'media/hpe.png'));
  f.data.media.push({ id: 7, filename: 'hpe.png' });
  const report = await importPartners({ ...f, apply: true });
  assert.equal(report.mediaCreated.length, 0);
  assert.equal(f.data.partners.find(p => p.name === 'HPE').logo, 7);
});
test('duplicate source names and paths outside partner assets are rejected', async (t) => {
  const f = fixture(t);
  await assert.rejects(importPartners({ ...f, partners: [...f.partners, ...f.partners], apply: true }), /Duplicate/);
  await assert.rejects(importPartners({ ...f, partners: [{ name: 'Bad', logo: '/../secret.png' }], apply: true }), /Unexpected/);
  assert.equal(f.calls(), 0);
});
test('uploaded images use a local encoded path, without enabling private-network fetching', () => {
  assert.equal(cmsMediaUrl({ filename: 'Dedsec Logo.jpg', url: 'http://localhost:3101/api/media/file/Dedsec%20Logo.jpg' }), '/api/media/file/Dedsec%20Logo.jpg');
  assert.equal(cmsMediaUrl({ filename: 'Logo #1%.png' }), '/api/media/file/Logo%20%231%25.png');
  assert.equal(cmsMediaUrl(1), null);
  assert.equal(cmsMediaUrl(null), null);
  assert.equal(cmsMediaUrl({ url: '/assets/old.png' }), '/assets/old.png');
});
