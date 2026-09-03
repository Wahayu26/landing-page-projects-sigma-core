import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(process.argv[2] || '.rollback/cms-ui-preview');
if (!existsSync(resolve(target, 'payload.config.ts'))) throw new Error('Expected legacy Payload source.');
const marker = '/* scs-auth-repair-v1 */';
const edits = [];
function patch(file, change) {
  const path = resolve(target, file);
  const source = readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
  if (!source.includes(marker)) edits.push([path, `${marker}\n${change(source)}`]);
}
function followupPatch(file, change) {
  const path = resolve(target, file);
  const pending = edits.findIndex(([name]) => name === path);
  const source = pending >= 0 ? edits[pending][1] : readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
  const result = change(source);
  if (source !== result) {
    if (pending >= 0) edits[pending][1] = result;
    else edits.push([path, result]);
  }
}
function replace(source, from, to) {
  if (!source.includes(from)) throw new Error(`Missing expected anchor: ${from}`);
  return source.replace(from, to);
}
patch('payload.config.ts', s => {
  s = `import { cmsAuthOrigin } from './cms/auth-origin';\n${s}`;
  s = replace(s, 'export default buildConfig({', 'export default buildConfig({\n  csrf: [cmsAuthOrigin()],');
  s = replace(s, 'views: {', 'views: {\n        logout: { Component: "/cms/components/CMSLogout" },');
  return replace(s, 'serverURL:\n    process.env.PAYLOAD_SERVER_URL ??\n    "http://localhost:3000",', 'serverURL: cmsAuthOrigin(),');
});
patch('cms/components/AdminDashboard.tsx', s => {
  s = `import { requireCMSUser } from '../require-admin';\n${s}`;
  s = replace(s, '  const payload = initPageResult.req.payload;', '  const user = requireCMSUser(initPageResult);\n  const req = initPageResult.req;\n  const payload = req.payload;');
  s = replace(s, '  const user = initPageResult.req.user as { name?: string } | null;\n', '');
  s = s.replaceAll('payload.count({', 'payload.count({ req, overrideAccess: false,');
  return replace(s, 'href="https://sigmacore.id/"', 'href={process.env.NEXT_PUBLIC_SERVER_URL || "/"}');
});
patch('cms/collections/Users.ts', s => {
  s = replace(s, 'import { authenticated } from "../access";', 'import { adminOrSelf, canAccessCMS, canSetRole, isCMSAdmin } from "../user-access";');
  s = replace(s, '    create: authenticated,\n    delete: authenticated,\n    read: authenticated,\n    update: authenticated,', '    admin: canAccessCMS,\n    create: isCMSAdmin,\n    delete: isCMSAdmin,\n    read: adminOrSelf,\n    update: adminOrSelf,');
  return replace(s, '      name: "role",', '      name: "role",\n      access: { create: canSetRole, update: canSetRole },');
});
followupPatch('cms/collections/Users.ts', s => {
  if (s.includes('ensureFirstAdmin')) return s;
  s = `import { ensureFirstAdmin } from '../first-admin';\n${s}`;
  return replace(s, '  auth: true,', '  auth: true,\n  hooks: { beforeChange: [ensureFirstAdmin] },');
});
// Validate every source anchor before changing any files.
cpSync(resolve(here, 'overlay'), target, { recursive: true });
for (const [path, source] of edits) writeFileSync(path, source);
console.log('Auth origin, guarded dashboard, confirmed logout and user-role access repaired. No database changes.');
