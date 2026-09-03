import assert from 'node:assert/strict';

const base = 'http://localhost:3101';
const response = await fetch(`${base}/api/partners?limit=100&depth=1&sort=order`);
assert.equal(response.status, 200);
const { docs, totalDocs } = await response.json();
assert.equal(totalDocs, 21);
assert.equal(docs.length, 21);
assert.ok(docs.some(doc => doc.name === 'DedSec'));
const results = [];
for (let start = 0; start < docs.length; start += 4) {
  results.push(...await Promise.all(docs.slice(start, start + 4).map(async (partner) => {
    assert.equal(partner.published, true);
    const localPath = `/api/media/file/${encodeURIComponent(partner.logo.filename)}`;
    const original = await fetch(base + localPath);
    assert.equal(original.status, 200, `${partner.name}: original upload`);
    const optimized = await fetch(`${base}/_next/image?${new URLSearchParams({ url: localPath, w: '384', q: '75' })}`);
    assert.equal(optimized.status, 200, `${partner.name}: optimized logo`);
    assert.match(optimized.headers.get('content-type') || '', /^image\//);
    const bytes = (await optimized.arrayBuffer()).byteLength;
    assert.ok(bytes > 0);
    return { name: partner.name, original: original.status, optimized: optimized.status, bytes };
  })));
}
const page = await fetch(base + '/');
assert.equal(page.status, 200);
const html = await page.text();
const rendered = new Set([...html.matchAll(/<img[^>]*alt="Logo ([^"]+)"/g)].map(match => match[1]));
assert.deepEqual([...rendered].sort(), docs.map(doc => doc.name).sort());
console.log(JSON.stringify({ uniquePartnersInPage: rendered.size, allOriginalsAndOptimizedLogosOK: true, results }, null, 2));
