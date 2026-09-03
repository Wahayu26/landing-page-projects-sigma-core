import type { Access, CollectionConfig, Field, GlobalConfig, PayloadRequest } from 'payload';
import { revalidatePath, revalidateTag } from 'next/cache.js';

const authenticated: Access = ({ req }) => Boolean(req.user);
const published: Access = ({ req }) => req.user ? true : {
  _status: { equals: 'published' }, published: { equals: true },
};

function refresh(req: PayloadRequest) {
  // Only offline import scripts set this flag; it is not read from HTTP input.
  if (req.context.skipContentRevalidation) return;
  revalidateTag('cms-content', { expire: 0 });
  revalidatePath('/(frontend)', 'layout');
  revalidatePath('/sitemap.xml');
}

function visibilityFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    if ('name' in field && field.name === 'published' && field.type === 'checkbox') {
      return { ...field, defaultValue: true, label: 'Tampilkan di website', admin: {
        ...field.admin, description: 'Hanya tampil setelah Dipublikasikan. Nonaktifkan untuk menyembunyikan item.',
      } };
    }
    if ('fields' in field) return { ...field, fields: visibilityFields(field.fields) };
    if (field.type === 'tabs') return { ...field, tabs: field.tabs.map((tab) => ({ ...tab, fields: visibilityFields(tab.fields) })) };
    return field;
  });
}

export function withContentWorkflow(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    versions: { drafts: { validate: true }, maxPerDoc: 30 },
    access: { ...collection.access, read: published, readVersions: authenticated },
    fields: visibilityFields(collection.fields),
    admin: { ...collection.admin,
      preview: (doc) => doc.id ? `/api/preview?collection=${collection.slug}&id=${encodeURIComponent(String(doc.id))}` : null,
      description: `${collection.admin?.description ?? ''} Simpan draft → Pratinjau → Publikasikan.`,
    },
    hooks: { ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), ({ doc, req }) => { refresh(req); return doc; }],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), ({ doc, req }) => { refresh(req); return doc; }],
    },
  };
}

const text = (name: string, label: string): Field => ({ name, label, type: 'text', required: true });
const description: Field = { name: 'description', label: 'Deskripsi', type: 'textarea', required: true };
const heading: Field[] = [text('eyebrow', 'Label kecil'), text('title', 'Judul bagian'), description];

export function withSiteWorkflow(global: GlobalConfig): GlobalConfig {
  return { ...global,
    versions: { drafts: { validate: true }, max: 30 },
    admin: { ...global.admin,
      preview: () => '/api/preview?global=site-settings',
      description: 'Simpan draft → Pratinjau → Publikasikan. Perubahan draft tidak mengubah website publik.',
    },
    access: { ...global.access,
      read: ({ req }) => req.user ? true : { _status: { equals: 'published' } },
      readVersions: authenticated,
    },
    hooks: { ...global.hooks,
      afterChange: [...(global.hooks?.afterChange ?? []), ({ doc, req }) => { refresh(req); return doc; }],
    },
    fields: [...global.fields,
      { name: 'about', label: 'Tentang perusahaan', type: 'group', fields: [
        text('eyebrow', 'Label kecil'), text('headline', 'Judul'), text('highlight', 'Judul aksen'), description,
      ] },
      { name: 'workflow', label: 'Cara kerja', type: 'group', fields: [...heading,
        { name: 'steps', label: 'Tahapan', type: 'array', required: true, minRows: 1, maxRows: 12,
          fields: [text('step', 'Nomor'), text('title', 'Nama tahap'), { name: 'text', label: 'Penjelasan', type: 'textarea', required: true }] },
      ] },
      { name: 'strengths', label: 'Keunggulan', type: 'group', fields: [...heading,
        { name: 'items', label: 'Daftar keunggulan', type: 'array', required: true, minRows: 1, maxRows: 8,
          fields: [text('title', 'Judul'), { name: 'text', label: 'Penjelasan', type: 'textarea', required: true }] },
      ] },
    ],
  };
}
