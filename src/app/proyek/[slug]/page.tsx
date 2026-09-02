import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Check } from 'lucide-react';

import { RichContent } from '@/components/RichContent';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  getProjectBySlug,
  getPublishedProjects,
  getSiteSettings,
} from '@/lib/landing-content';

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedProjects()).map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  if (!project) return { title: 'Proyek tidak ditemukan' };
  const origin = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
  const image = project.image
    ? new URL(project.image, origin).toString()
    : null;
  const title = `${project.title} | Case Study SCS`;
  return {
    title,
    description: project.summary,
    openGraph: {
      title,
      description: project.summary,
      type: 'article',
      images: image ? [image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: project.summary,
      images: image ? [image] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSettings(),
  ]);
  if (!project) notFound();

  const storySections = [
    { number: '01', label: 'Tantangan', data: project.challenge },
    { number: '02', label: 'Solusi', data: project.solution },
    { number: '03', label: 'Hasil', data: project.result },
  ];

  return (
    <main className='inner-page'>
      <SiteHeader />
      <section className='detail-hero detail-hero--project'>
        <Image
          src={project.image ?? '/assets/connected-city.jpg'}
          alt={project.title}
          fill
          priority
          sizes='100vw'
        />
        <div className='detail-hero__shade' />
        <div className='shell detail-hero__content'>
          <nav className='breadcrumb' aria-label='Breadcrumb'>
            <Link href='/'>Beranda</Link>
            <span>/</span>
            <Link href='/proyek'>Proyek</Link>
            <span>/</span>
            <strong>{project.title}</strong>
          </nav>
          <div className='detail-hero__copy'>
            <p className='eyebrow light'>
              <span /> {project.industry}
            </p>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
            <div className='project-identity'>
              <span>Client</span>
              <strong>{project.client || 'Confidential client'}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className='case-study-story section'>
        <div className='shell case-study-story__grid'>
          <aside>
            <p className='eyebrow'>
              <span /> Case study
            </p>
            <h2>Alur implementasi dan dampaknya.</h2>
            {project.highlights.length > 0 ? (
              <ul>
                {project.highlights.map((item) => (
                  <li key={item}>
                    <Check size={15} /> {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </aside>
          <div className='case-study-steps'>
            {storySections.map((section) => (
              <article key={section.label}>
                <span>{section.number}</span>
                <h3>{section.label}</h3>
                {section.data ? (
                  <RichContent data={section.data} />
                ) : (
                  <p>
                    Detail {section.label.toLowerCase()} dapat dilengkapi
                    melalui CMS sebelum case study dipublikasikan.
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {project.technologies.length > 0 ? (
        <section className='technology-strip section'>
          <div className='shell'>
            <p className='eyebrow light'>
              <span /> Technology stack
            </p>
            <div>
              {project.technologies.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className='detail-next-step section'>
        <div className='shell detail-next-step__card'>
          <div>
            <p className='eyebrow light'>
              <span /> Your next project
            </p>
            <h2>Punya tantangan yang serupa?</h2>
            <p>
              Ceritakan kondisi dan target bisnis Anda. Tim kami akan membantu
              menyusun pendekatan yang relevan.
            </p>
          </div>
          <Link className='button button-primary' href='/#kontak'>
            Mulai konsultasi <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <WhatsAppButton phone={settings.contact.phone} />
      <SiteFooter />
    </main>
  );
}
