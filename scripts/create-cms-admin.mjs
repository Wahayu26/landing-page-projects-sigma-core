// One-off, server-only bootstrap. Run with `payload run` in the LEGACY CMS.
// stdin: password + NUL + confirmation. Never pass passwords as CLI arguments.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const account = {
  name: 'wahyu satria aji',
  email: 'wahyusatriaaji64@gmail.com',
  role: 'admin',
};

class SafeError extends Error {}
let payload;
let input;
let password;
let confirmation;
let created = false;
let exitCode = 0;

try {
  input = readFileSync(0);
  const parts = input.toString('utf8').split('\0');
  if (parts.length !== 2) throw new SafeError('Input password tidak valid.');
  [password, confirmation] = parts;
  if (password !== confirmation) throw new SafeError('Konfirmasi password berbeda.');
  if (password.length < 16 || password.length > 128) {
    throw new SafeError('Gunakan password unik sepanjang 16–128 karakter.');
  }
  if (process.env.PAYLOAD_DB_PROVIDER !== 'postgres') {
    throw new SafeError('Berhenti: konfigurasi CMS bukan PostgreSQL.');
  }
  let database;
  try { database = new URL(process.env.DATABASE_URL); } catch {
    throw new SafeError('Berhenti: DATABASE_URL tidak valid.');
  }
  if (!['postgres:', 'postgresql:'].includes(database.protocol) ||
      database.hostname !== 'postgres' || database.pathname !== '/scs_cms') {
    throw new SafeError('Berhenti: database tujuan bukan postgres/scs_cms.');
  }
  if (!process.env.PAYLOAD_SECRET ||
      process.env.PAYLOAD_SECRET === 'local-dev-secret-change-before-deploying') {
    throw new SafeError('Berhenti: secret CMS belum dikonfigurasi dengan benar.');
  }

  // These changes affect only this CLI process, not the running CMS.
  process.env.NODE_ENV = 'production';
  process.env.PAYLOAD_DB_PUSH = 'false';
  process.env.PAYLOAD_DROP_DATABASE = 'false';
  process.env.PAYLOAD_TELEMETRY_DISABLED = '1';

  const { getPayload } = await import('payload');
  const configModule = await import(pathToFileURL(resolve('payload.config.ts')).href);
  const config = await configModule.default;
  config.logger = { options: { level: 'silent' } };
  config.email = () => ({
    name: 'admin-bootstrap-no-email',
    defaultFromAddress: 'noreply@sigmacore.id',
    defaultFromName: 'Sigma Core',
    sendEmail: async () => { throw new SafeError('Pengiriman email dinonaktifkan untuk proses ini.'); },
  });

  payload = await getPayload({ config, disableDBConnect: true, disableOnInit: true });
  payload.db.disableCreateDatabase = true;
  payload.db.push = false;
  payload.db.prodMigrations = undefined;
  await payload.db.connect();

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: account.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (existing.docs.length) {
    throw new SafeError('Email sudah terdaftar. Akun dan password lama TIDAK diubah.');
  }

  const user = await payload.create({
    collection: 'users',
    data: { ...account, password },
    overrideAccess: true,
    disableVerificationEmail: true,
    depth: 0,
  });
  created = true;
  // Never print the full user, tokens, password, salt or hash.
  console.log('BERHASIL:', JSON.stringify({
    id: user.id, name: user.name, email: user.email, role: user.role,
  }));
} catch (error) {
  exitCode = 1;
  console.error(error instanceof SafeError ? error.message :
    'Gagal memproses akun. Periksa daftar users sebelum mencoba lagi; jangan kirim password atau secret.');
} finally {
  input?.fill(0);
  password = undefined;
  confirmation = undefined;
  if (payload) {
    try { await payload.destroy(); } catch {
      exitCode = 1;
      console.error(created ?
        'Akun sudah dibuat, tetapi penutupan koneksi gagal. Verifikasi akun sebelum mengulang.' :
        'Penutupan koneksi gagal.');
    }
  }
}
// payload run exits with 0 by default; explicitly preserve failures here.
process.exit(exitCode);
