import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { draftMode, headers } from 'next/headers';
import { getPayload } from 'payload';
import type { User } from '@/payload-types';
import config from '@payload-config';

export const getPreviewUser = cache(async () => {
  if (!(await draftMode()).isEnabled) return null;
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  return user;
});

// Request headers and session cookies never enter the shared Data Cache.
async function queryContent(user: User | null = null) {
  const payload = await getPayload({ config });
  const common = { depth: 2, pagination: false, overrideAccess: false, user,
    draft: Boolean(user), where: user ? undefined : {
      _status: { equals: 'published' }, published: { equals: true },
    },
  };
  const [solutions, partners, projects, insights, settings] = await Promise.all([
    payload.find({ ...common, collection: 'solutions', sort: 'order' }),
    payload.find({ ...common, collection: 'partners', sort: 'order' }),
    payload.find({ ...common, collection: 'projects', sort: 'order' }),
    payload.find({ ...common, collection: 'insights', sort: '-publishedAt' }),
    payload.findGlobal({ slug: 'site-settings', depth: 0, draft: Boolean(user), overrideAccess: false, user }),
  ]);
  return { solutions: solutions.docs, partners: partners.docs, projects: projects.docs, insights: insights.docs, settings };
}

// This legacy Payload application does not enable Cache Components. Keep the
// supported previous cache model; only plain CMS JSON is persisted here.
const publicContent = unstable_cache(() => queryContent(), ['cms-content-workflow-v1'], {
  tags: ['cms-content'], revalidate: 300,
});

export const readCMSContent = cache(async (publishedOnly = false) => {
  const user = publishedOnly ? null : await getPreviewUser();
  return user ? queryContent(user) : publicContent();
});
