// Offline tests: no real CMS, credentials or database are accessed.
// node --experimental-vm-modules --test scripts/create-cms-admin.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';

const source = readFileSync(new URL('./create-cms-admin.mjs', import.meta.url), 'utf8');
const testPassword = 'offline-fixture-only-password';

async function run(options = {}) {
  const output = [];
  const calls = [];
  let result;
  const db = {
    connect: async () => {
      assert.equal(db.disableCreateDatabase, true);
      assert.equal(db.push, false);
      assert.equal(db.prodMigrations, undefined);
      calls.push('connect');
    },
  };
  const fakePayload = {
    db,
    find: async (args) => {
      assert.equal(args.collection, 'users');
      assert.equal(args.where.email.equals, 'wahyusatriaaji64@gmail.com');
      calls.push('find');
      return { docs: options.exists ? [{ id: 2 }] : [] };
    },
    create: async (args) => {
      calls.push('create');
      if (options.createFails) throw new Error(`secret ${testPassword}`);
      assert.equal(args.data.password, testPassword);
      assert.equal(args.data.role, 'admin');
      assert.equal(args.overrideAccess, true);
      assert.equal(args.disableVerificationEmail, true);
      return { id: 2, ...args.data, salt: 'hidden-salt', hash: 'hidden-hash' };
    },
    destroy: async () => {
      calls.push('destroy');
      if (options.destroyFails) throw new Error('close failed');
    },
  };
  const config = {};
  const context = createContext({
    URL,
    console: { log: (...args) => output.push(args.join(' ')), error: (...args) => output.push(args.join(' ')) },
    process: {
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        DATABASE_URL: options.database || 'postgresql://fixture:fixture@postgres/scs_cms',
        PAYLOAD_SECRET: options.noSecret ? '' : 'offline-config-fixture',
        PAYLOAD_DROP_DATABASE: 'true',
      },
      exit: (code) => { result = code; },
    },
  });
  const makeModule = async (exports) => {
    const mod = new SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
    await mod.link(() => {});
    await mod.evaluate();
    return mod;
  };
  const mod = new SourceTextModule(source, {
    context,
    importModuleDynamically: async (specifier) => {
      if (specifier === 'payload') return makeModule({ getPayload: async (args) => {
        assert.equal(args.disableOnInit, true);
        assert.equal(args.disableDBConnect, true);
        assert.equal(context.process.env.PAYLOAD_DROP_DATABASE, 'false');
        assert.equal(config.logger.options.level, 'silent');
        await assert.rejects(config.email().sendEmail());
        return fakePayload;
      } });
      assert.equal(specifier, 'file:///app/payload.config.ts');
      return makeModule({ default: Promise.resolve(config) });
    },
  });
  await mod.link(async (specifier) => {
    if (specifier === 'node:fs') return makeModule({ readFileSync: () => Buffer.from(options.input ?? `${testPassword}\0${testPassword}`) });
    if (specifier === 'node:path') return makeModule({ resolve: () => '/app/payload.config.ts' });
    if (specifier === 'node:url') return makeModule({ pathToFileURL: () => new URL('file:///app/payload.config.ts') });
    throw new Error(`Unexpected import: ${specifier}`);
  });
  await mod.evaluate();
  const text = output.join('\n');
  for (const secret of [testPassword, 'hidden-salt', 'hidden-hash', 'offline-config-fixture']) {
    assert.ok(!text.includes(secret), 'Secrets must not be printed');
  }
  return { result, calls, text };
}

test('creates exactly the requested admin and closes the connection', async () => {
  const r = await run();
  assert.equal(r.result, 0);
  assert.deepEqual(r.calls, ['connect', 'find', 'create', 'destroy']);
  assert.match(r.text, /BERHASIL.*wahyusatriaaji64@gmail.com/);
});
test('duplicate email never changes an existing account', async () => {
  const r = await run({ exists: true });
  assert.equal(r.result, 1);
  assert.deepEqual(r.calls, ['connect', 'find', 'destroy']);
});
for (const [name, options] of Object.entries({
  mismatch: { input: `${testPassword}\0different` },
  short: { input: 'short\0short' },
  malformed: { input: testPassword },
  wrongDatabase: { database: 'postgresql://fixture@postgres/scs_core' },
  missingSecret: { noSecret: true },
})) {
  test(`${name}: stops before accessing the database`, async () => {
    const r = await run(options);
    assert.equal(r.result, 1);
    assert.deepEqual(r.calls, []);
  });
}
test('failure hides raw error and still closes connection', async () => {
  const r = await run({ createFails: true });
  assert.equal(r.result, 1);
  assert.equal(r.calls.at(-1), 'destroy');
});
test('cleanup failure warns that the account was already created', async () => {
  const r = await run({ destroyFails: true });
  assert.equal(r.result, 1);
  assert.match(r.text, /Akun sudah dibuat/);
});
