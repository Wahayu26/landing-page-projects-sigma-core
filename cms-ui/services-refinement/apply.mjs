import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const target = resolve(process.argv[2] || resolve(root, '.rollback/cms-ui-preview'));
if (!existsSync(resolve(target, 'payload.config.ts'))) throw new Error('Expected the legacy Payload application.');
const read = (file) => readFileSync(resolve(target, file), 'utf8').replaceAll('\r\n', '\n');
const pagePath = 'app/(frontend)/page.tsx';
let page = read(pagePath);
if (!page.includes('<SolutionsSection solutions={solutions} />')) {
  const section = /      <section className="solutions section" id="solusi">[\s\S]*?      <\/section>/;
  if (!section.test(page)) throw new Error('Solutions section changed; inspect before applying.');
  page = page.replace(section, '      <SolutionsSection solutions={solutions} />');
  page = 'import { SolutionsSection } from "@/components/SolutionsSection";\n' + page;
}
const layoutPath = 'app/(frontend)/layout.tsx';
if (page.includes('<Check') && !page.includes('  Check,')) page = page.replace('  ArrowUpRight,', '  ArrowUpRight,\n  Check,');
let layout = read(layoutPath);
if (!layout.includes('import "./services-refinement.css";')) {
  if (!layout.includes('import "./globals.css";')) throw new Error('Missing public stylesheet anchor.');
  layout = layout.replace('import "./globals.css";', 'import "./globals.css";\nimport "./services-refinement.css";');
}
// Only public presentation files: preserve CMS queries, settings, schema, DB and media.
for (const component of ['SolutionsSection', 'SectionHeading']) {
  copyFileSync(resolve(root, `src/components/${component}.tsx`), resolve(target, `components/${component}.tsx`));
}
copyFileSync(resolve(root, 'src/app/services-refinement.css'), resolve(target, 'app/(frontend)/services-refinement.css'));
writeFileSync(resolve(target, pagePath), page);
writeFileSync(resolve(target, layoutPath), layout);
console.log('Public Services + typography patch applied. No CMS data changed.');
