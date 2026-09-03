import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { getPayload } from 'payload';
import config from '../payload.config';

const directory = resolve(process.env.AUTH_QA_DIR || '.');
if (!directory.startsWith(resolve('.data') + sep + 'auth-qa-') || process.env.PAYLOAD_SQLITE_URL !== `file:${resolve(directory, 'qa.db').replaceAll('\\', '/')}`) {
  throw new Error('Refusing to seed anything except the explicitly selected disposable auth QA snapshot.');
}
const payload = await getPayload({ config });
try {
  const accounts = JSON.parse(readFileSync(resolve(directory, 'accounts.json'), 'utf8'));
  for (const data of Object.values(accounts)) {
    await payload.create({ collection: 'users', data: data as { name: string; email: string; password: string; role: 'admin' | 'editor' }, overrideAccess: true });
  }
  console.log('Two disposable QA accounts created in snapshot only.');
} finally { await payload.destroy(); }
