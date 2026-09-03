// Apply only presentation files to the legacy CMS source, never to the new frontend.
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = resolve(process.argv[2] || '/app');
const bundle = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(source, 'payload.config.ts');
const dashboardPath = resolve(source, 'cms/components/AdminDashboard.tsx');
if (!existsSync(configPath) || !existsSync(dashboardPath)) {
  throw new Error('Expected legacy CMS source (payload.config.ts and cms/components). No files changed.');
}
let config = readFileSync(configPath, 'utf8');
let dashboard = readFileSync(dashboardPath, 'utf8');
const componentAnchor = 'components: {\n      graphics:';
const metadataAnchor = 'titleSuffix: "— Sigma Core CMS",';
config = config.replaceAll('\r\n', '\n');
if (!config.includes('/* scs-cms-ui-v1 */')) {
  if (!config.includes(componentAnchor) || !config.includes(metadataAnchor)) {
    throw new Error('CMS configuration differs from expected baseline. Review manually; no files changed.');
  }
  config = config.replace(componentAnchor, 'components: {\n      /* scs-cms-ui-v1 */\n      beforeNavLinks: ["/cms/components/AdminLogo"],\n      graphics:');
  config = config.replace(metadataAnchor, `${metadataAnchor}
      icons: {
        icon: [{ url: "/assets/scs-icon.png?v=cms-ui-1", type: "image/png" }],
        shortcut: ["/assets/scs-icon.png?v=cms-ui-1"],
        apple: [{ url: "/assets/scs-icon.png?v=cms-ui-1", type: "image/png" }],
      },`);
}
dashboard = dashboard.replace('href="/" target="_blank"', 'href="https://sigmacore.id/" target="_blank" rel="noopener noreferrer"');

const overlayFiles = ['app/(payload)/custom.scss', 'cms/components/AdminIcon.tsx', 'cms/components/AdminLogo.tsx', 'public/assets/scs-icon.png'];
for (const relative of overlayFiles) {
  if (!existsSync(resolve(bundle, 'overlay', relative))) throw new Error(`Missing overlay: ${relative}. No files changed.`);
}
for (const relative of overlayFiles) {
  const from = resolve(bundle, 'overlay', relative);
  const to = resolve(source, relative);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}
writeFileSync(configPath, config);
writeFileSync(dashboardPath, dashboard);
console.log('CMS presentation patch applied. Auth, collections, database settings and migrations unchanged.');
