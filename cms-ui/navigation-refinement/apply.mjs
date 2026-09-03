import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const target = resolve(process.argv[2] || resolve(root, '.rollback/cms-ui-preview'));
if (!existsSync(resolve(target, 'payload.config.ts'))) throw new Error('Expected the legacy Payload application.');
const layoutPath = resolve(target, 'app/(frontend)/layout.tsx');
let layout = readFileSync(layoutPath, 'utf8').replaceAll('\r\n', '\n');
const cssImport = 'import "./navigation-refinement.css";';
if (!layout.includes(cssImport)) {
  const anchor = 'import "./services-refinement.css";';
  if (!layout.includes(anchor)) throw new Error('Apply the Services public refinement first.');
  layout = layout.replace(anchor, `${anchor}\n${cssImport}`);
}
copyFileSync(resolve(root, 'src/components/FooterContent.tsx'), resolve(target, 'components/FooterContent.tsx'));
copyFileSync(resolve(root, 'src/components/CompanyLogo.tsx'), resolve(target, 'components/CompanyLogo.tsx'));
copyFileSync(resolve(root, 'src/components/SiteHeader.tsx'), resolve(target, 'components/site-header.tsx'));
copyFileSync(resolve(root, 'public/assets/scs-full-logo.png'), resolve(target, 'public/assets/scs-full-logo.png'));
copyFileSync(resolve(root, 'src/components/SiteFooter.tsx'), resolve(target, 'components/site-footer.tsx'));
copyFileSync(resolve(root, 'src/app/navigation-refinement.css'), resolve(target, 'app/(frontend)/navigation-refinement.css'));
writeFileSync(layoutPath, layout);
console.log('Supplied full logo, transparent header and compact dark footer applied. CMS data unchanged.');
