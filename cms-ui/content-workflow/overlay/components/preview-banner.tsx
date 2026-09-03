import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPreviewUser } from '@/lib/cms-content';

async function exitPreview() {
  'use server';
  (await draftMode()).disable();
  redirect('/');
}

export async function PreviewBanner() {
  if (!(await draftMode()).isEnabled) return null;
  const user = await getPreviewUser();
  return <aside className="cms-preview-banner" role="status">
    <span>{user ? 'Pratinjau draft — belum tampil ke publik. Simpan draft di CMS, lalu muat ulang untuk melihat perubahan.' : 'Sesi CMS berakhir — hanya konten publik yang ditampilkan.'}</span>
    <a href="/admin">Kembali ke CMS</a>
    <form action={exitPreview}><button type="submit">Keluar preview</button></form>
  </aside>;
}
