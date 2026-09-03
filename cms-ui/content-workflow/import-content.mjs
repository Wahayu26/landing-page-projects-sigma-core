export const iconKeys = {
  'it-infrastructure': 'infrastructure', 'network-telecommunication': 'network',
  cybersecurity: 'security', 'data-center-cloud': 'cloud', 'managed-services': 'managed-service',
  'it-asset-procurement': 'procurement',
};

export function solutionSeed(solution, index) {
  if (!iconKeys[solution.slug]) throw new Error(`Unmapped solution ${solution.slug}`);
  return { title: solution.title, slug: solution.slug, summary: solution.description,
    category: solution.category, outcome: solution.outcome, order: index + 1,
    iconKey: iconKeys[solution.slug], features: solution.items.map(label => ({ label })),
    benefits: solution.benefits.map(({ title, text }) => ({ title, description: text })),
    useCases: solution.useCases.map(label => ({ label })), published: true, _status: 'published',
  };
}

// Only fill missing scalar/group values; never replace a nonempty existing array.
export function fillMissing(existing, seed) {
  if (Array.isArray(seed)) return Array.isArray(existing) && existing.length ? existing : seed;
  if (seed && typeof seed === 'object') return Object.fromEntries(Object.entries(seed).map(([key, value]) => [key, fillMissing(existing?.[key], value)]));
  return existing === undefined || existing === null || existing === '' ? seed : existing;
}

export async function importContent({ payload, solutions, settings, apply = false }) {
  const context = { skipContentRevalidation: true };
  const current = await payload.find({ collection: 'solutions', pagination: false, depth: 0 });
  const bySlug = new Map(current.docs.map(doc => [doc.slug, doc]));
  const report = { mode: apply ? 'apply' : 'dry-run', created: [], preserved: [], settings: 'preserved' };
  for (const [index, solution] of solutions.entries()) {
    const data = solutionSeed(solution, index);
    if (bySlug.has(data.slug)) { report.preserved.push(data.slug); continue; }
    if (apply) await payload.create({ collection: 'solutions', data, context });
    report.created.push(data.slug);
  }
  const currentSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0 });
  const merged = fillMissing(currentSettings, settings);
  const changed = Object.keys(settings).some(key => JSON.stringify(currentSettings[key]) !== JSON.stringify(merged[key]));
  if (changed) {
    // Do not publish somebody else's newer draft when rerunning the importer.
    const draftSettings = await payload.findGlobal({ slug: 'site-settings', depth: 0, draft: true });
    if (draftSettings._status === 'draft' && draftSettings.updatedAt && draftSettings.updatedAt !== currentSettings.updatedAt) {
      throw new Error('Site settings has an editorial draft. Merge it manually before importing.');
    }
    report.settings = 'fill-missing-and-publish';
    if (apply) await payload.updateGlobal({ slug: 'site-settings', data: { ...merged, _status: 'published' }, context });
  }
  return report;
}
