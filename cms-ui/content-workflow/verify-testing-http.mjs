// Testing only. Creates/deletes one QA solution. A site-settings draft is restored.
import assert from 'node:assert/strict';
const origin = 'http://localhost:3101';
if (!process.env.CMS_QA_PASSWORD) throw new Error('Set CMS_QA_PASSWORD for the existing isolated ui-preview test account.');
const request = (path, options = {}) => fetch(`${origin}${path}`, { redirect: 'manual', ...options });
async function json(path, options = {}) {
  const response = await request(path, options);
  const data = await response.json();
  assert.ok(response.ok, `${options.method ?? 'GET'} ${path}: ${response.status} ${JSON.stringify(data).slice(0, 600)}`);
  return data;
}
const login = await json('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'ui-preview@example.test', password: process.env.CMS_QA_PASSWORD }) });
const auth = { Authorization: `JWT ${login.token}`, 'Content-Type': 'application/json', Origin: origin };
const send = (method, data) => ({ method, headers: auth, body: JSON.stringify(data) });
const stamp = Date.now();
const slug = `cms-qa-${stamp}`;
const title = `QA published ${stamp}`;
const draftTitle = `QA secret draft ${stamp}`;
let id;
let settingsOriginal;
let globalTouched = false;
try {
  assert.equal((await request('/api/preview?global=site-settings')).status, 401);
  assert.equal((await request('/api/preview?collection=users&id=1', { headers: auth })).status, 400);
  const original = (await json('/api/solutions?depth=0&limit=100')).docs;
  assert.equal(original.length, 6);
  const partnerCount = (await json('/api/partners?depth=0&limit=100')).totalDocs;
  assert.equal(partnerCount, 20);
  const data = { slug, title, summary: 'Isolated workflow verification.', category: 'platform', iconKey: 'infrastructure', order: 999, published: true, features: [{ label: 'QA fixture' }], _status: 'draft' };
  const created = await json('/api/solutions?draft=true', send('POST', data));
  id = created.doc.id;
  assert.equal((await request(`/solusi/${slug}`)).status, 404, 'Draft-only detail must not be public');
  const preview = await request(`/api/preview?collection=solutions&id=${id}`, { headers: auth });
  assert.equal(preview.status, 307); assert.equal(preview.headers.get('location'), `/solusi/${slug}`);
  const cookie = preview.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  assert.match(cookie, /__prerender_bypass=/);
  const previewHeaders = { ...auth, Cookie: cookie };
  const previewResponse = await request(`/solusi/${slug}`, { headers: previewHeaders });
  const previewHTML = await previewResponse.text();
  assert.equal(previewResponse.status, 200);
  assert.match(previewResponse.headers.get('cache-control'), /private/);
  assert.match(previewHTML, /noindex/); assert.ok(previewHTML.includes(title)); assert.match(previewHTML, /Pratinjau draft/);
  assert.equal((await request(`/solusi/${slug}`, { headers: { Cookie: cookie } })).status, 404, 'Preview cookie alone is not authorization');
  await json(`/api/solutions/${id}`, send('PATCH', { _status: 'published' }));
  assert.ok((await (await request('/')).text()).includes(title), 'Publish invalidates warm homepage cache');
  await json(`/api/solutions/${id}?draft=true`, send('PATCH', { title: draftTitle, _status: 'draft' }));
  const publicHTML = await (await request(`/solusi/${slug}`)).text();
  assert.ok(publicHTML.includes(title)); assert.ok(!publicHTML.includes(draftTitle));
  assert.ok(!JSON.stringify(await json('/api/solutions?draft=true&limit=100')).includes(draftTitle), 'Anonymous draft REST read must not leak');
  assert.ok((await (await request(`/solusi/${slug}`, { headers: previewHeaders })).text()).includes(draftTitle));
  await json(`/api/solutions/${id}`, send('PATCH', { title: draftTitle, _status: 'published' }));
  assert.ok((await (await request('/')).text()).includes(draftTitle), 'Publishing draft updates homepage immediately');
  const renamed = `${slug}-renamed`;
  await json(`/api/solutions/${id}`, send('PATCH', { slug: renamed, _status: 'published' }));
  assert.equal((await request(`/solusi/${slug}`)).status, 404);
  assert.equal((await request(`/solusi/${renamed}`)).status, 200);
  await json(`/api/solutions/${id}`, send('PATCH', { _status: 'draft' }));
  assert.equal((await request(`/solusi/${renamed}`)).status, 404);
  assert.ok(!(await (await request('/')).text()).includes(draftTitle), 'Unpublish invalidates listing');
  assert.ok(!(await (await request('/sitemap.xml', { headers: previewHeaders })).text()).includes(renamed), 'Sitemap never includes drafts');

  settingsOriginal = await json('/api/globals/site-settings?depth=0', { headers: auth });
  const settingsLatest = await json('/api/globals/site-settings?depth=0&draft=true', { headers: auth });
  assert.equal(settingsLatest._status, 'published', 'Do not disturb an existing user draft');
  const globalTitle = `QA global draft ${stamp}`;
  globalTouched = true;
  await json('/api/globals/site-settings?draft=true', send('POST', { hero: { ...settingsOriginal.hero, headline: globalTitle }, _status: 'draft' }));
  assert.ok(!(await (await request('/')).text()).includes(globalTitle));
  assert.ok(!JSON.stringify(await json('/api/globals/site-settings?draft=true')).includes(globalTitle), 'Anonymous global draft access must not leak');
  const globalPreview = await request('/api/preview?global=site-settings', { headers: auth });
  assert.equal(globalPreview.headers.get('location'), '/');
  assert.ok((await (await request('/', { headers: previewHeaders })).text()).includes(globalTitle));
  await json('/api/globals/site-settings', send('POST', { hero: { ...settingsOriginal.hero, headline: globalTitle }, _status: 'published' }));
  assert.ok((await (await request('/')).text()).includes(globalTitle), 'Global publish invalidates cache');
  console.log('PASS: 6 solutions + 20 partners; draft isolation, authenticated preview, noindex/private cache, publish, edits, slug changes, unpublish, sitemap, global draft/publish.');
} finally {
  if (globalTouched && settingsOriginal) {
    await json('/api/globals/site-settings', send('POST', { ...settingsOriginal, _status: 'published' }));
  }
  if (id) await json(`/api/solutions/${id}`, { method: 'DELETE', headers: auth });
  await request('/api/users/logout', { method: 'POST', headers: auth });
}
assert.equal((await json('/api/solutions?limit=100')).totalDocs, 6);
console.log('QA fixture removed; original website settings restored.');
