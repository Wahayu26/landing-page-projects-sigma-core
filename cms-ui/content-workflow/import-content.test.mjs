import test from 'node:test';
import assert from 'node:assert/strict';
import { fillMissing, importContent, solutionSeed, iconKeys } from './import-content.mjs';

const solutions = Object.keys(iconKeys).map(slug => ({ slug, title: slug, description: 'Summary', category: 'platform', outcome: 'Outcome', items: ['Feature'], benefits: [{ title: 'Benefit', text: 'Details' }], useCases: ['Use case'] }));
test('maps all six solutions to CMS fields and explicit published status', () => {
  assert.equal(solutions.length, 6);
  solutions.forEach((solution, i) => {
    const mapped = solutionSeed(solution, i);
    assert.equal(mapped._status, 'published'); assert.equal(mapped.order, i + 1);
    assert.deepEqual(mapped.benefits, [{ title: 'Benefit', description: 'Details' }]);
  });
});
test('unknown solution fails before attempting to insert', () => assert.throws(() => solutionSeed({ slug: 'unknown' }, 0)));
test('merge fills missing fields without overwriting user content, false, zero, or nonempty arrays', () => {
  assert.deepEqual(fillMissing({ hero: { title: 'Edited' }, items: [{ text: 'User' }], flag: false, count: 0 },
    { hero: { title: 'Original', subtitle: 'New' }, items: [{ text: 'Seed' }], flag: true, count: 1 }),
    { hero: { title: 'Edited', subtitle: 'New' }, items: [{ text: 'User' }], flag: false, count: 0 });
});
test('dry run writes nothing; apply is add-only; second run creates no duplicates', async () => {
  const docs = [{ slug: solutions[0].slug, title: 'User edit' }];
  let settings = {}; let writes = 0;
  const payload = {
    find: async () => ({ docs }), findGlobal: async () => settings,
    create: async ({ data }) => { writes++; docs.push(data); },
    updateGlobal: async ({ data }) => { writes++; settings = data; },
  };
  const args = { payload, solutions, settings: { hero: { headline: 'Original' } } };
  const dry = await importContent(args);
  assert.equal(writes, 0); assert.equal(dry.created.length, 5);
  await importContent({ ...args, apply: true });
  assert.equal(writes, 6); assert.equal(docs[0].title, 'User edit');
  const rerun = await importContent({ ...args, apply: true });
  assert.equal(writes, 6); assert.equal(rerun.created.length, 0);
});
