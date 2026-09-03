import { draftMode } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';

const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return new Response('Login ke CMS terlebih dahulu.', { status: 401, headers: privateHeaders });
  const params = new URL(request.url).searchParams;
  let target: string;
  if (params.get('global') === 'site-settings') {
    target = '/';
  } else {
    const collection = params.get('collection');
    if (!['solutions', 'partners', 'projects', 'insights'].includes(collection ?? '') || !/^\d+$/.test(params.get('id') ?? '')) {
      return new Response('Target preview tidak valid.', { status: 400, headers: privateHeaders });
    }
    const slug = collection as 'solutions' | 'partners' | 'projects' | 'insights';
    const doc = await payload.findByID({ collection: slug, id: Number(params.get('id')), draft: true, overrideAccess: false, user, depth: 0, disableErrors: true });
    if (!doc) return new Response('Simpan draft terlebih dahulu.', { status: 404, headers: privateHeaders });
    if (slug === 'partners') target = '/#ekosistem';
    else {
      const contentSlug = 'slug' in doc ? doc.slug : '';
      if (typeof contentSlug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(contentSlug)) {
        return new Response('Slug harus berupa huruf kecil, angka, dan tanda hubung.', { status: 400, headers: privateHeaders });
      }
      target = `/${{ solutions: 'solusi', projects: 'proyek', insights: 'insight' }[slug]}/${contentSlug}`;
    }
  }
  (await draftMode()).enable();
  // Relative, allowlisted redirect. No URL, host, or redirect parameter is trusted.
  return new Response(null, { status: 307, headers: { ...privateHeaders, Location: target } });
}
