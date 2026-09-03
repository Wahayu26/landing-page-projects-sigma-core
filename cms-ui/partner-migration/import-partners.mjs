import { readFileSync } from 'node:fs';
import { basename, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';

export const normalizedName = (name) => name.trim().toLowerCase().replace(/\s+/g, ' ');
const digest = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

// Add-only import: never change/delete an existing partner or upload.
export async function importPartners({ payload, partners, publicDir, apply = false }) {
  const existing = await payload.find({ collection: 'partners', pagination: false, depth: 0 });
  const media = await payload.find({ collection: 'media', pagination: false, depth: 0 });
  const names = new Set(existing.docs.map((doc) => normalizedName(doc.name)));
  const mediaByFilename = new Map(media.docs.map((doc) => [doc.filename, doc]));
  const sourceNames = new Set();
  const plan = [];
  const skipped = [];
  for (const [index, partner] of partners.entries()) {
    const key = normalizedName(partner.name);
    if (sourceNames.has(key)) throw new Error(`Duplicate source partner: ${partner.name}`);
    sourceNames.add(key);
    if (names.has(key)) { skipped.push(partner.name); continue; }
    const asset = resolve(publicDir, `.${partner.logo}`);
    const assetRoot = resolve(publicDir, 'assets/partners') + sep;
    if (!asset.startsWith(assetRoot)) throw new Error(`Unexpected asset path: ${partner.logo}`);
    const hash = digest(asset); // Preflight every source before writing anything.
    const filename = basename(asset);
    const matchingMedia = mediaByFilename.get(filename);
    // Only reuse a matching filename when the uploaded original has identical bytes.
    const reusable = matchingMedia && digest(resolve(publicDir, 'media', filename)) === hash
      ? matchingMedia : null;
    plan.push({ name: partner.name, order: index + 1, asset, mediaID: reusable?.id });
  }

  if (!names.has('dedsec')) {
    const dedsec = media.docs.filter((doc) => doc.filename === 'Dedsec Logo.jpg');
    if (dedsec.length !== 1) throw new Error('Expected exactly one existing Dedsec Logo.jpg upload. No data changed.');
    digest(resolve(publicDir, 'media', dedsec[0].filename));
    plan.push({ name: 'DedSec', order: partners.length + 1, mediaID: dedsec[0].id });
  }
  const report = {
    mode: apply ? 'apply' : 'dry-run', before: existing.totalDocs,
    planned: plan.map(({ name, order, mediaID }) => ({ name, order, reuseMediaID: mediaID ?? null })),
    skipped, created: [], mediaCreated: [],
  };
  if (!apply) return report;

  for (const item of plan) {
    let logo = item.mediaID;
    if (logo == null) {
      const upload = await payload.create({
        collection: 'media', data: { alt: `Logo ${item.name}` },
        filePath: item.asset, overwriteExistingFiles: false, depth: 0,
      });
      logo = upload.id;
      report.mediaCreated.push({ id: upload.id, filename: upload.filename });
    }
    const created = await payload.create({
      collection: 'partners', depth: 0,
      data: { name: item.name, logo, order: item.order, published: true },
    });
    report.created.push({ id: created.id, name: created.name, logo });
  }
  const after = await payload.find({ collection: 'partners', pagination: false, depth: 0 });
  for (const before of existing.docs) {
    const unchanged = after.docs.find((doc) => doc.id === before.id);
    if (JSON.stringify(unchanged) !== JSON.stringify(before)) throw new Error(`Existing record changed: ${before.id}`);
  }
  report.after = after.totalDocs;
  return report;
}
