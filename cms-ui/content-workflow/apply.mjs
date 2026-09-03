import { readFileSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(process.argv[2] || '.rollback/cms-ui-preview');
if (!existsSync(resolve(target, 'payload.config.ts'))) throw new Error('Expected the legacy Payload source, not the frontend-only repository.');
const marker = '/* scs-content-workflow-v1 */';
function edit(file, transform) {
  const path = resolve(target, file);
  const source = readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
  if (source.includes(marker)) return;
  const result = transform(source);
  if (result === source) throw new Error(`Patch did not match ${file}`);
  writeFileSync(path, `${marker}\n${result}`);
}
function replace(source, from, to) {
  if (!source.includes(from)) throw new Error(`Missing source anchor: ${from.slice(0, 100)}`);
  return source.replace(from, to);
}

cpSync(resolve(here, 'overlay'), target, { recursive: true });
cpSync(resolve(here, 'import-content.mjs'), resolve(target, 'scripts/import-content.mjs'));
edit('payload.config.ts', (s) => {
  s = `import { withContentWorkflow, withSiteWorkflow } from './cms/content-workflow';\n${s}`;
  for (const name of ['Solutions', 'Partners', 'Projects', 'Insights']) s = replace(s, `    ${name},`, `    withContentWorkflow(${name}),`);
  return replace(s, '    SiteSettings,', '    withSiteWorkflow(SiteSettings),');
});
edit('lib/landing-content.ts', (s) => {
  s = s.replace('import { getPayload } from "payload";', 'import { readCMSContent } from "./cms-content";');
  s = s.replace('import config from "@payload-config";\n', '');
  s = s.replace(/import \{\n  partners as fallbackPartners,[\s\S]*?from "@\/content\/site";/, 'import { solutionCategoryLabels } from "@/content/site";');
  s = s.replace(/const fallbackSettings = \{[\s\S]*?\n\};\n/, '');
  s = s.replace(/function fallbackSolutionView\([\s\S]*?\n}\n\n/, '');
  s = s.replace(/  const fallback = fallbackSolutions.find[^\n]*\n/, '');
  s = s.replaceAll(' ?? fallback?.category', '').replaceAll(' || fallback?.outcome', '').replaceAll(' ?? fallback?.items', '').replaceAll(' ?? fallback?.useCases', '').replaceAll(' ?? fallback?.icon', '').replaceAll('      fallback?.benefits ??\n', '');
  s = s.slice(0, s.indexOf('export const getPublishedSolutions')) + `
// The CMS is authoritative: empty/unpublished data must stay empty.
export const getPublishedSolutions = cache(async (publishedOnly = false): Promise<SolutionView[]> =>
  (await readCMSContent(publishedOnly)).solutions.map(solutionView));
export const getSolutionBySlug = cache(async (slug: string): Promise<SolutionView | null> =>
  (await getPublishedSolutions()).find((doc) => doc.slug === slug) ?? null);
export const getPublishedPartners = cache(async () =>
  (await readCMSContent()).partners.flatMap((doc) => { const view = partnerView(doc); return view ? [view] : []; }));
export const getPublishedProjects = cache(async (publishedOnly = false): Promise<ProjectView[]> =>
  (await readCMSContent(publishedOnly)).projects.map(projectView));
export const getProjectBySlug = cache(async (slug: string): Promise<ProjectView | null> =>
  (await getPublishedProjects()).find((doc) => doc.slug === slug) ?? null);
export const getPublishedInsights = cache(async (publishedOnly = false): Promise<InsightView[]> =>
  (await readCMSContent(publishedOnly)).insights.map(insightView));
export const getInsightBySlug = cache(async (slug: string): Promise<InsightView | null> =>
  (await getPublishedInsights()).find((doc) => doc.slug === slug) ?? null);
export const getSiteSettings = cache(async () => {
  const { settings } = await readCMSContent();
  if (!settings.hero || !settings.about || !settings.workflow || !settings.strengths) {
    throw new Error('Publish the migrated site settings before serving this website.');
  }
  return { ...settings, companyFacts: settings.companyFacts ?? [],
    workflow: { ...settings.workflow, steps: settings.workflow.steps ?? [] },
    strengths: { ...settings.strengths, items: settings.strengths.items ?? [] },
  };
});
export const getLandingContent = cache(async () => {
  const [solutions, partners, projects, insights, settings] = await Promise.all([
    getPublishedSolutions(), getPublishedPartners(), getPublishedProjects(), getPublishedInsights(), getSiteSettings(),
  ]);
  return { solutions, partners, projects: projects.slice(0, 3), insights: insights.slice(0, 3), settings };
});
`;
  if (s.includes('fallback')) throw new Error('Unexpected remaining fallback');
  return s;
});
edit('app/(frontend)/page.tsx', (s) => {
  const pairs = [
    ['import { process, values } from "@/content/site";\n', ''],
    ['<span /> Who we are', '<span /> {settings.about.eyebrow}'],
    ['Lebih dari sekadar', '{settings.about.headline}'],
    ['<em>technology vendor.</em>', '<em>{settings.about.highlight}</em>'],
    ['PT Sigma Core Solusindo membantu perusahaan membangun fondasi teknologi yang kuat\n              dan berkelanjutan. Bukan hanya menyediakan produk, kami memastikan setiap komponen\n              bekerja sebagai satu ekosistem yang utuh.', '{settings.about.description}'],
    ['<span /> How we work', '<span /> {settings.workflow.eyebrow}'],
    ['Dari kebutuhan bisnis menuju sistem yang bekerja.', '{settings.workflow.title}'],
    ['Kami menyatukan beragam teknologi menjadi ekosistem yang seamless, optimal, dan mudah\n            dikembangkan.', '{settings.workflow.description}'],
    ['{process.map(', '{settings.workflow.steps.map('],
    ['<span /> Why SCS', '<span /> {settings.strengths.eyebrow}'],
    ['Dibangun untuk menjadi partner, bukan sekadar penyedia.', '{settings.strengths.title}'],
    ['Setiap proyek dijalankan dengan kombinasi keahlian teknis, disiplin implementasi,\n              dan pemahaman terhadap tujuan bisnis.', '{settings.strengths.description}'],
    ['{values.map(', '{settings.strengths.items.map('],
  ];
  for (const [from, to] of pairs) s = replace(s, from, to);
  return s;
});
edit('app/(frontend)/layout.tsx', (s) => {
  s = `import { draftMode } from 'next/headers';\nimport { PreviewBanner } from '@/components/preview-banner';\n${s}`;
  s = replace(s, 'export const metadata: Metadata =', 'const baseMetadata: Metadata =');
  s = replace(s, 'export default function RootLayout', `export async function generateMetadata(): Promise<Metadata> {
  return { ...baseMetadata, icons: { icon: '/assets/scs-icon.png' },
    ...((await draftMode()).isEnabled ? { robots: { index: false, follow: false } } : {}),
  };
}
export default function RootLayout`);
  return replace(s, '<body>{children}</body>', '<body>{children}<PreviewBanner /></body>');
});
edit('app/(frontend)/globals.css', (s) => s + `
.cms-preview-banner { position: fixed; z-index: 10000; bottom: 16px; left: 16px; right: 16px; padding: 14px 18px; display: flex; align-items: center; flex-wrap: wrap; gap: 12px; color: #fff; background: #102d47; border: 1px solid #67d9e8; border-radius: 12px; box-shadow: 0 8px 32px #0005; font: 14px/1.5 Arial, sans-serif; }
.cms-preview-banner span { flex: 1 1 300px; }
.cms-preview-banner a { color: #8de8f3; text-decoration: underline; }
.cms-preview-banner form { margin: 0; }
.cms-preview-banner button { border: 0; border-radius: 6px; padding: 8px 12px; color: #102d47; background: #fff; cursor: pointer; font: inherit; }
`);
edit('app/(frontend)/sitemap.ts', (s) => s.replaceAll('getPublishedSolutions()', 'getPublishedSolutions(true)').replaceAll('getPublishedProjects()', 'getPublishedProjects(true)').replaceAll('getPublishedInsights()', 'getPublishedInsights(true)'));
edit('cms/components/AdminDashboard.tsx', (s) => replace(s,
  'where: { published: { equals: true } }',
  'where: { published: { equals: true }, _status: { equals: "published" } }')
  .replaceAll('where: { published: { equals: true } }', 'where: { published: { equals: true }, _status: { equals: "published" } }'));
for (const [path, getter] of [['solusi', 'getPublishedSolutions'], ['proyek', 'getPublishedProjects'], ['insight', 'getPublishedInsights']]) {
  edit(`app/(frontend)/${path}/[slug]/page.tsx`, (s) => {
    const match = s.match(/export async function generateStaticParams\(\) \{[\s\S]*?\n\}/);
    if (!match) throw new Error(`Static params missing in ${path}`);
    return replace(s, match[0], replace(match[0], `${getter}()`, `${getter}(true)`));
  });
}
console.log(`Content workflow applied to ${target}. Schema migration + content import required before starting.`);
