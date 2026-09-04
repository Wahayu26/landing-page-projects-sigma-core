import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from 'lucide-react';

import { ContactForm } from '@/components/ContactForm';
import { RichContent } from '@/components/RichContent';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  getPublishedSolutions,
  getSiteSettings,
  getSolutionBySlug,
} from '@/lib/landing-content';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const solutions = await getPublishedSolutions(true);
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) return { title: 'Solusi tidak ditemukan' };

  const origin = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
  const image = solution.image
    ? new URL(solution.image, origin).toString()
    : null;
  const title = `${solution.title} | PT Sigma Core Solusindo`;

  return {
    title,
    description: solution.outcome,
    openGraph: {
      title,
      description: solution.outcome,
      type: 'website',
      images: image ? [image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: solution.outcome,
      images: image ? [image] : [],
    },
  };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const [solution, solutions, settings] = await Promise.all([
    getSolutionBySlug(slug),
    getPublishedSolutions(),
    getSiteSettings(),
  ]);
  if (!solution) notFound();

  const Icon = solution.icon;

  return (
    <main className='inner-page'>
      <SiteHeader />

      <section className='detail-hero detail-hero--solution'>
        <Image
          src={solution.image ?? '/assets/server-room.jpg'}
          unoptimized={Boolean(solution.image)}
          alt={solution.title}
          fill
          priority
          sizes='100vw'
        />
        <div className='detail-hero__shade' />
        <div className='detail-hero__grid' aria-hidden='true' />
        <div className='shell detail-hero__content'>
          <nav className='breadcrumb' aria-label='Breadcrumb'>
            <Link href='/'>Beranda</Link>
            <span>/</span>
            <Link href='/#solusi'>Solusi</Link>
            <span>/</span>
            <strong>{solution.title}</strong>
          </nav>
          <div className='detail-hero__copy'>
            <p className='eyebrow light'>
              <span /> {solution.categoryLabel}
            </p>
            <div className='detail-hero__title-row'>
              <h1>{solution.title}</h1>
              <div className='detail-hero__icon'>
                <Icon size={34} strokeWidth={1.5} />
              </div>
            </div>
            <p>{solution.outcome}</p>
            <div className='hero-actions'>
              <Link className='button button-primary' href='#konsultasi'>
                Diskusikan solusi <ArrowUpRight size={18} />
              </Link>
              <Link className='button button-ghost' href='#kapabilitas'>
                Lihat kapabilitas <ArrowDown size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className='detail-overview section' id='kapabilitas'>
        <div className='shell detail-overview__grid'>
          <div>
            <p className='eyebrow'>
              <span /> Solution overview
            </p>
            <h2 className='section-title'>
              Dirancang untuk bekerja sebagai satu fondasi yang utuh.
            </h2>
          </div>
          <div className='detail-overview__copy'>
            <p>{solution.description}</p>
            <ul className='capability-list'>
              {solution.items.map((item) => (
                <li key={item}>
                  <Check size={16} /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className='benefits-section section'>
        <div className='shell'>
          <div className='section-heading-row'>
            <div>
              <p className='eyebrow'>
                <span /> Business value
              </p>
              <h2 className='section-title'>
                Teknologi yang diterjemahkan menjadi hasil bisnis.
              </h2>
            </div>
            <p>
              Setiap komponen dipilih dan diintegrasikan berdasarkan kebutuhan,
              risiko, serta target operasional Anda.
            </p>
          </div>
          <div className='benefit-grid'>
            {solution.benefits.map((benefit, index) => (
              <article key={benefit.title}>
                <span>0{index + 1}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {solution.content ? (
        <section className='editorial-section section'>
          <div className='shell editorial-layout'>
            <aside>
              <p className='eyebrow'>
                <span /> Detail solusi
              </p>
              <h2>Lingkup dan pendekatan.</h2>
            </aside>
            <RichContent data={solution.content} mediaAPIBase={solution.mediaAPIBase} />
          </div>
        </section>
      ) : null}

      <section className='use-case-section section'>
        <div className='shell use-case-grid'>
          <div>
            <p className='eyebrow light'>
              <span /> Common use cases
            </p>
            <h2 className='section-title light-title'>
              Mulai dari kebutuhan yang paling relevan.
            </h2>
          </div>
          <div className='use-case-list'>
            {solution.useCases.map((useCase, index) => (
              <div key={useCase}>
                <span>0{index + 1}</span>
                <strong>{useCase}</strong>
                <ArrowRight size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {solution.partners.length > 0 ? (
        <section className='related-partners section'>
          <div className='shell'>
            <p className='eyebrow'>
              <span /> Technology ecosystem
            </p>
            <h2 className='section-title'>
              Partner teknologi untuk solusi ini.
            </h2>
            <div className='related-partner-grid'>
              {solution.partners.map((partner) => (
                <div key={partner.name}>
                  <Image
                    src={partner.logo}
                    unoptimized
                    alt={`Logo ${partner.name}`}
                    width={260}
                    height={100}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className='contact section' id='konsultasi'>
        <div className='shell contact-card detail-contact-card'>
          <div className='contact-copy'>
            <p className='eyebrow light'>
              <span /> Consultation
            </p>
            <h2>Bahas kebutuhan {solution.title} Anda.</h2>
            <p>
              Tim SCS akan membantu memetakan kondisi, prioritas, dan pendekatan
              implementasi yang paling tepat.
            </p>
          </div>
          <ContactForm
            defaultInterest={solution.slug}
            sourcePage={`/solusi/${solution.slug}`}
            solutions={solutions.map((item) => ({
              slug: item.slug,
              title: item.title,
            }))}
          />
        </div>
      </section>

      <WhatsAppButton phone={settings.contact.phone} />
      <SiteFooter />
    </main>
  );
}
