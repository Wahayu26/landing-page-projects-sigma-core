import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = resolve(process.argv[2] || '');
const target = resolve(source, 'lib/landing-content.ts');
if (!existsSync(resolve(source, 'payload.config.ts')) || !existsSync(target)) {
  throw new Error('Expected a legacy Payload CMS source directory.');
}
let content = readFileSync(target, 'utf8').replaceAll('\r\n', '\n');
const oldHelper = 'return typeof value === "object" && value?.url ? value.url : null;';
if (!content.includes(oldHelper) && !content.includes('return cmsMediaUrl(value);')) {
  throw new Error('Unknown media helper; no files changed.');
}
if (content.includes(oldHelper)) {
  content = 'import { cmsMediaUrl } from "./cms-media-url";\n' + content.replace(oldHelper, 'return cmsMediaUrl(value);');
}
copyFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'cms-media-url.ts'), resolve(source, 'lib/cms-media-url.ts'));
writeFileSync(target, content);
console.log('CMS media URLs now use the same-app /api/media/file route. Database unchanged.');
