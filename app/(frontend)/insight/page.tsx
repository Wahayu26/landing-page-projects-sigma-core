import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getPublishedInsights, getSiteSettings } from "@/lib/landing-content";

export const metadata: Metadata = {
  title: "Insight Teknologi | PT Sigma Core Solusindo",
  description: "Insight, panduan, dan berita seputar infrastruktur, cybersecurity, cloud, jaringan, dan transformasi teknologi.",
};

export const revalidate = 300;

export default async function InsightsPage() {
  const [insights, settings] = await Promise.all([getPublishedInsights(), getSiteSettings()]);
  const categories = [...new Set(insights.map((insight) => insight.category))];

  return (
    <main className="inner-page listing-page">
      <SiteHeader />
      <section className="listing-hero listing-hero--insight">
        <div className="listing-hero__grid" aria-hidden="true" />
        <div className="shell listing-hero__content">
          <p className="eyebrow light"><span /> Knowledge hub</p>
          <h1>Perspektif untuk keputusan teknologi yang <em>lebih baik.</em></h1>
          <p>Insight praktis dari tim SCS untuk membantu organisasi memahami risiko, pilihan arsitektur, dan peluang transformasi.</p>
          {categories.length > 0 ? <div className="category-chips">{categories.map((category) => <span key={category}>{category}</span>)}</div> : null}
        </div>
      </section>

      <section className="insights section" id="insight-list">
        <div className="shell">
          {insights.length > 0 ? (
            <div className="insight-grid insight-grid--listing">
              {insights.map((insight, index) => (
                <Link className="insight-card" href={`/insight/${insight.slug}`} key={insight.slug}>
                  <div className="insight-card__visual">
                    {insight.image ? <Image src={insight.image} alt={insight.title} fill sizes="(max-width: 580px) 100vw, 33vw" /> : <span>INSIGHT / {String(index + 1).padStart(2, "0")}</span>}
                  </div>
                  <div className="insight-card__content">
                    <div><span>{insight.category}</span><time dateTime={insight.publishedAt}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(insight.publishedAt))}</time></div>
                    <h2>{insight.title}</h2>
                    <p>{insight.excerpt}</p>
                    <strong className="card-text-link">Baca insight <ArrowUpRight size={16} /></strong>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-content-state">
              <span>Knowledge hub sedang disiapkan</span>
              <h2>Artikel akan tampil setelah dipublikasikan melalui CMS.</h2>
              <p>Editor dapat mengelola kategori, cover, isi artikel, metadata SEO, dan solusi terkait dari dashboard.</p>
              <Link className="button button-primary" href="/#kontak">Konsultasi sekarang <ArrowUpRight size={18} /></Link>
            </div>
          )}
        </div>
      </section>
      <WhatsAppButton phone={settings.contact.phone} />
      <SiteFooter />
    </main>
  );
}
