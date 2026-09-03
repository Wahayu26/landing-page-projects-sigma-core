import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { cmsAuthOrigin } from './overlay/cms/auth-origin.ts';
import { adminOrSelf, isCMSAdmin, canAccessCMS, canSetRole } from './overlay/cms/user-access.ts';
import { requestCMSLogout } from './overlay/cms/components/logout-request.mjs';
import { ensureFirstAdmin } from './overlay/cms/first-admin.ts';

test('first-user onboarding retains an administrator without promoting subsequent accounts', async () => {
  const data = { name: 'QA', role: 'editor' };
  const req = { user: null, payload: { count: async () => ({ totalDocs: 0 }) } };
  assert.equal((await ensureFirstAdmin({ data, operation: 'create', req })).role, 'admin');
  req.payload.count = async () => ({ totalDocs: 1 });
  assert.equal((await ensureFirstAdmin({ data, operation: 'create', req })).role, 'editor');
  assert.equal((await ensureFirstAdmin({ data, operation: 'update', req })).role, 'editor');
});

test('CMS origin follows testing URL unless explicit separate CMS origin is configured', () => {
  assert.equal(cmsAuthOrigin({ NEXT_PUBLIC_SERVER_URL: 'http://localhost:3101/' }), 'http://localhost:3101');
  assert.equal(cmsAuthOrigin({ PAYLOAD_SERVER_URL: 'https://cms.sigmacore.id', NEXT_PUBLIC_SERVER_URL: 'https://sigmacore.id' }), 'https://cms.sigmacore.id');
  for (const url of ['*', 'javascript:alert(1)', 'https://user:password@cms.test', 'https://cms.test/path', 'https://cms.test/?redirect=x']) {
    assert.throws(() => cmsAuthOrigin({ PAYLOAD_SERVER_URL: url }));
  }
});
test('only admins manage accounts and roles; editors can access only their own account', () => {
  const admin = { req: { user: { id: 1, collection: 'users', role: 'admin' } } };
  const editor = { req: { user: { id: 2, collection: 'users', role: 'editor' } } };
  assert.equal(isCMSAdmin(admin), true);
  assert.equal(canSetRole(admin), true);
  assert.equal(adminOrSelf(admin), true);
  assert.equal(canAccessCMS(editor), true);
  assert.equal(isCMSAdmin(editor), false);
  assert.equal(canSetRole(editor), false);
  assert.deepEqual(adminOrSelf(editor), { id: { equals: 2 } });
  for (const user of [null, { id: 1, collection: 'customers', role: 'admin' }]) {
    assert.equal(isCMSAdmin({ req: { user } }), false);
    assert.equal(adminOrSelf({ req: { user } }), false);
    assert.equal(canAccessCMS({ req: { user } }), false);
  }
});

const guardSource = ts.transpileModule(readFileSync(new URL('./overlay/cms/require-admin.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace('import { redirect } from "next/navigation";', 'const redirect = (url) => { throw new Error(`REDIRECT:${url}`); };');
const { requireCMSUser } = await import(`data:text/javascript;base64,${Buffer.from(guardSource).toString('base64')}`);
test('custom dashboard rejects anonymous and unauthorized requests before content reads', () => {
  const config = { routes: { admin: '/admin' }, admin: { user: 'users', routes: { login: '/login', unauthorized: '/unauthorized' } } };
  const request = (user, allowed) => ({ req: { user, payload: { config } }, permissions: { canAccessAdmin: allowed } });
  assert.throws(() => requireCMSUser(request(null, false)), /REDIRECT:\/admin\/login/);
  assert.throws(() => requireCMSUser(request({ collection: 'users' }, false)), /REDIRECT:\/admin\/unauthorized/);
  const user = { id: 1, collection: 'users', name: 'QA' };
  assert.equal(requireCMSUser(request(user, true)), user);
});
test('logout uses POST, credentials and no-store', async () => {
  await requestCMSLogout('/api/users', async (url, options) => {
    assert.equal(url, '/api/users/logout');
    assert.deepEqual(options, { method: 'POST', credentials: 'include', cache: 'no-store' });
    return { ok: true };
  });
});
test('failed logout with an active session is an error, never a success notification', async () => {
  await assert.rejects(requestCMSLogout('/api/users', async url => url.endsWith('/logout') ? { ok: false, status: 400 } : { ok: true, json: async () => ({ user: { id: 1 } }) }));
  await assert.rejects(requestCMSLogout('/api/users', async () => ({ ok: false, status: 503 })));
  await assert.rejects(requestCMSLogout('/api/users', async () => { throw new Error('offline'); }));
});
test('already expired sessions can return to login after a successful me check', async () => {
  await requestCMSLogout('/api/users', async url => url.endsWith('/logout') ? { ok: false, status: 400 } : { ok: true, json: async () => ({ user: null }) });
});
