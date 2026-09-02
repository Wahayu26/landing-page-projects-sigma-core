import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

import { RichContent } from '@/components/RichContent';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  getInsightBySlug,
  getPublishedInsights,
  getSiteSettings,
} from '@/lib/landing-content';

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedInsights()).map((insight) => ({
    slug: insight.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const insight = await getInsightBySlug((await params).slug);
  if (!insight) return { title: 'Insight tidak ditemukan' };
  const origin = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
  const image = insight.image
    ? new URL(insight.image, origin).toString()
    : null;
  return {
    title: insight.seo.title,
    description: insight.seo.description,
    openGraph: {
      title: insight.seo.title,
      description: insight.seo.description,
      type: 'article',
      publishedTime: insight.publishedAt,
      images: image ? [image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: insight.seo.title,
      description: insight.seo.description,
      images: image ? [image] : [],
    },
  };
}

export default async function InsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const [insight, settings] = await Promise.all([
    getInsightBySlug(slug),
    getSiteSettings(),
  ]);
  if (!insight) notFound();

  return (
    <main className='inner-page article-page'>
      <SiteHeader />
      <article>
        <header className='article-hero'>
          <div className='shell article-hero__content'>
            <nav className='breadcrumb' aria-label='Breadcrumb'>
              <Link href='/'>Beranda</Link>
              <span>/</span>
              <Link href='/insight'>Insight</Link>
              <span>/</span>
              <strong>{insight.category}</strong>
            </nav>
            <p className='eyebrow light'>
              <span /> {insight.category}
            </p>
            <h1>{insight.title}</h1>
            <p>{insight.excerpt}</p>
            <time dateTime={insight.publishedAt}>
              {new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(insight.publishedAt))}
            </time>
          </div>
        </header>

        {insight.image ? (
          <div className='shell article-cover'>
            <Image
              src={insight.image}
              alt={insight.title}
              fill
              priority
              sizes='(max-width: 1320px) 100vw, 1280px'
            />
          </div>
        ) : null}

        <div className='shell article-layout'>
          <aside>
            <span>PT Sigma Core Solusindo</span>
            <p>
              Perspektif teknologi untuk keputusan bisnis yang lebih terukur.
            </p>
          </aside>
          <RichContent data={insight.content} />
        </div>
      </article>

      {insight.relatedSolutions.length > 0 ? (
        <section className='related-solutions section'>
          <div className='shell'>
            <p className='eyebrow'>
              <span /> Related solutions
            </p>
            <h2 className='section-title'>
              Lanjutkan dari insight menuju implementasi.
            </h2>
            <div>
              {insight.relatedSolutions.map((solution) => (
                <Link href={`/solusi/${solution.slug}`} key={solution.slug}>
                  {solution.title}
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className='detail-next-step section'>
        <div className='shell detail-next-step__card'>
          <div>
            <p className='eyebrow light'>
              <span /> Talk to our team
            </p>
            <h2>Ingin membahas topik ini lebih lanjut?</h2>
            <p>
              Hubungkan insight dengan kondisi infrastruktur dan prioritas
              bisnis perusahaan Anda.
            </p>
          </div>
          <Link className='button button-primary' href='/#kontak'>
            Diskusikan kebutuhan <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <WhatsAppButton phone={settings.contact.phone} />
      <SiteFooter />
    </main>
  );
}
