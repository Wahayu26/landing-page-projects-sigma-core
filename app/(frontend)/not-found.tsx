import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="not-found-page">
        <div className="shell">
          <span>404</span>
          <h1>Halaman yang Anda cari tidak tersedia.</h1>
          <p>Konten mungkin belum dipublikasikan, dipindahkan, atau alamatnya tidak tepat.</p>
          <Link className="button button-primary" href="/"><ArrowLeft size={18} /> Kembali ke beranda</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
