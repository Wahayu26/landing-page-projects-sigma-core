import test from 'node:test';
import assert from 'node:assert/strict';
import { cmsAPIBase, cmsMediaURL, mapCMSSolution, readPublishedCMSSolutions, safeContentLink } from '../src/lib/cms-solutions.ts';

const base = cmsAPIBase('https://cms.example.test/api');
const published = (extra = {}) => ({ slug: 'it-infrastructure', title: 'IT Infrastructure', summary: 'Ringkasan', published: true, _status: 'published', ...extra });
const response = (docs, extra = {}) => Response.json({ docs, hasNextPage: false, ...extra });

test('maps existing solutions model into public presentation values', () => {
  const result = mapCMSSolution(published({ category: 'protection', features: [{ label: 'Backup' }], benefits: [{ title: 'Reliable', description: 'Operasional stabil' }], useCases: [{ label: 'Data center' }] }), base);
  assert.equal(result.category, 'protection');
  assert.equal(result.outcome, 'Ringkasan');
  assert.deepEqual(result.items, ['Backup']);
  assert.deepEqual(result.benefits, [{ title: 'Reliable', text: 'Operasional stabil' }]);
  assert.deepEqual(result.useCases, ['Data center']);
});
test('draft and intentionally unpublished records never become public', () => {
  for (const record of [published({ _status: 'draft' }), published({ published: false }), { title: 'Private' }]) assert.equal(mapCMSSolution(record, base), null);
});
test('authoritative empty CMS stays empty, not bundled fallback', async () => {
  assert.deepEqual(await readPublishedCMSSolutions(base.href, async () => response([])), []);
});
test('public query excludes drafts, paginates, and sorts consistently', async () => {
  const urls = [];
  const result = await readPublishedCMSSolutions(base.href, async (url) => {
    urls.push(url);
    return urls.length === 1 ? response([published({ order: 9 })], { hasNextPage: true, nextPage: 2 })
      : response([published({ slug: 'cloud', order: 1 }), published({ slug: 'secret', _status: 'draft' })]);
  });
  assert.deepEqual(result.map((doc) => doc.slug), ['cloud', 'it-infrastructure']);
  assert.equal(urls[0].pathname, '/api/solutions');
  assert.equal(urls[0].searchParams.get('where[_status][equals]'), 'published');
  assert.equal(urls[0].searchParams.get('where[published][equals]'), 'true');
  assert.equal(urls[0].searchParams.get('draft'), 'false');
  assert.equal(urls[1].searchParams.get('page'), '2');
});
test('API errors and malformed data surface, rather than silently show old demo items', async () => {
  for (const request of [async () => new Response('', { status: 500 }), async () => Response.json({}), async () => { throw new Error('timeout'); }, async () => response([published({ slug: '../admin' })])]) {
    await assert.rejects(readPublishedCMSSolutions(base.href, request));
  }
});
test('duplicate slugs and invalid pagination are explicit failures', async () => {
  await assert.rejects(readPublishedCMSSolutions(base.href, async () => response([published(), published()])), /Duplicate/);
  await assert.rejects(readPublishedCMSSolutions(base.href, async () => response([], { hasNextPage: true, nextPage: 1 })), /pagination/);
});
test('media uses configured CMS path, not stale or third-party URLs', () => {
  assert.equal(cmsMediaURL({ filename: 'Logo SCS.png', url: 'http://old-host/other' }, base), 'https://cms.example.test/api/media/file/Logo%20SCS.png');
  for (const invalid of [1, null, { filename: '../secret' }, { url: 'https://evil.test/file' }]) assert.equal(cmsMediaURL(invalid, base), null);
});
test('unpublished partner relations are filtered', () => {
  const relatedPartners = [{ name: 'Visible', logo: { filename: 'logo.png' }, published: true, _status: 'published' }, { name: 'Hidden', logo: { filename: 'hidden.png' }, published: false, _status: 'published' }];
  assert.deepEqual(mapCMSSolution(published({ relatedPartners }), base).partners.map((doc) => doc.name), ['Visible']);
});
test('unsafe CMS endpoints and content links are rejected', () => {
  for (const url of ['file:///api', 'https://user:pass@cms.example/api', 'https://cms.example/api?q=1']) assert.throws(() => cmsAPIBase(url));
  for (const link of ['javascript:alert(1)', 'data:text/html,bad', '//evil.test', '/\\evil.test', 'java\nscript:bad']) assert.equal(safeContentLink(link), null);
  for (const link of ['/solusi/cloud', '#kontak', 'https://sigmacore.id', 'mailto:sales@sigmacore.id']) assert.equal(safeContentLink(link), link);
});
