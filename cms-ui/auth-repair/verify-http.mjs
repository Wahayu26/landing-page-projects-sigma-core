import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

const base = 'http://localhost:3102';
const directory = resolve(process.env.AUTH_QA_DIR || '.');
if (!directory.startsWith(resolve('.rollback/cms-ui-preview/.data') + sep + 'auth-qa-')) throw new Error('Disposable QA snapshot required.');
const accounts = JSON.parse(readFileSync(resolve(directory, 'accounts.json'), 'utf8'));
let assertions = 0;
function check(value, message) { assert.ok(value, message); assertions++; console.log(`PASS ${message}`); }
async function request(path, { cookie, origin = base, method = 'GET', data, ...options } = {}) {
  return fetch(`${base}${path}`, { method, redirect: 'manual', ...options,
    headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(data ? { 'Content-Type': 'application/json' } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
}
async function login(account) {
  const res = await request('/api/users/login', { method: 'POST', data: { email: account.email, password: account.password } });
  check(res.status === 200, `${account.role} login succeeds`);
  const cookie = res.headers.getSetCookie().find(c => c.startsWith('payload-token='))?.split(';')[0];
  check(!!cookie, `${account.role} receives session cookie`);
  return { cookie, user: (await res.json()).user };
}
const noAuth = await request('/admin');
const noAuthHTML = await noAuth.text();
check(noAuth.status === 307 && noAuth.headers.get('location') === '/admin/login' || noAuthHTML.includes('NEXT_REDIRECT') && noAuthHTML.includes('/admin/login'), 'anonymous dashboard redirects to login');
check(!noAuthHTML.includes('scs-stat-card__count'), 'anonymous dashboard exposes no content counts');
const denied = await request('/api/users/login', { method: 'POST', data: { email: accounts.admin.email, password: 'not-the-qa-password' } });
check(denied.status === 401, 'incorrect password rejected');
const admin = await login(accounts.admin);
const editor = await login(accounts.editor);
const me = await request('/api/users/me', { cookie: admin.cookie });
check((await me.json()).user?.id === admin.user.id, 'same-origin session recognized');
for (const account of [admin, editor]) {
  const pref = await request('/api/payload-preferences/auth-qa', { cookie: account.cookie, method: 'POST', data: { value: { marker: account.user.id } } });
  check(pref.status === 200, `user ${account.user.id} preference saves`);
}
const foreignOrigin = await request('/api/payload-preferences/auth-qa', { cookie: admin.cookie, origin: 'https://untrusted.example', method: 'DELETE' });
check(foreignOrigin.status === 401 || foreignOrigin.status === 403, 'cross-origin preference deletion rejected');
const reset = await request(`/api/payload-preferences?depth=0&where[user.value][equals]=${admin.user.id}`, { cookie: admin.cookie, method: 'DELETE' });
check(reset.status === 200, 'account reset preferences succeeds');
const afterReset = await request('/api/payload-preferences/auth-qa', { cookie: admin.cookie });
check((await afterReset.json()).value == null, 'own saved preference removed');
const editorPref = await request('/api/payload-preferences/auth-qa', { cookie: editor.cookie });
check((await editorPref.json()).value?.marker === editor.user.id, 'other user preferences preserved');
const createUser = await request('/api/users', { cookie: editor.cookie, method: 'POST', data: { name: 'Forbidden', email: 'forbidden@example.test', password: accounts.editor.password, role: 'admin' } });
check(createUser.status === 403, 'editor cannot create accounts');
await request(`/api/users/${editor.user.id}`, { cookie: editor.cookie, method: 'PATCH', data: { role: 'admin' } });
const editorMe = await request('/api/users/me', { cookie: editor.cookie });
check((await editorMe.json()).user?.role === 'editor', 'editor cannot elevate own role');
const crossLogout = await request('/api/users/logout', { cookie: admin.cookie, origin: 'https://untrusted.example', method: 'POST' });
check(!crossLogout.ok, 'cross-origin logout rejected');
const logout = await request('/api/users/logout', { cookie: admin.cookie, method: 'POST' });
check(logout.status === 200, 'logout succeeds');
check(logout.headers.getSetCookie().some(cookie => cookie.startsWith('payload-token=;')), 'logout expires cookie');
const replay = await request('/api/users/me', { cookie: admin.cookie });
check((await replay.json()).user == null, 'old session cannot be replayed after logout');
const privateAfterLogout = await request('/api/users', { cookie: admin.cookie });
check(privateAfterLogout.status === 403 || privateAfterLogout.status === 401, 'protected API denied after logout');
await login(accounts.admin);
console.log(`${assertions} HTTP assertions passed against disposable port 3102 only.`);
