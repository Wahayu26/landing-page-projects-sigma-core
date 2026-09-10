import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

async function exitPreview() {
  "use server";
  (await draftMode()).disable();
  redirect("/");
}

export async function PreviewBanner() {
  if (!(await draftMode()).isEnabled) return null;
  return (
    <aside className="cms-preview-banner" role="status">
      <span>Pratinjau draft aktif—perubahan ini belum tampil kepada pengunjung.</span>
      <a href={process.env.CMS_ADMIN_URL || "http://localhost:3101/admin"}>Kembali ke CMS</a>
      <form action={exitPreview}><button type="submit">Keluar preview</button></form>
    </aside>
  );
}
