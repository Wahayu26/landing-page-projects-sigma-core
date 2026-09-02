import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';

import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { getPublishedProjects, getSiteSettings } from '@/lib/landing-content';

export const metadata: Metadata = {
  title: 'Proyek & Case Study | PT Sigma Core Solusindo',
  description:
    'Implementasi solusi teknologi SCS untuk kebutuhan infrastruktur, keamanan, cloud, jaringan, dan operasional bisnis.',
};

export const revalidate = 300;

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(),
  ]);

  return (
    <main className='inner-page listing-page'>
      <SiteHeader />
      <section className='listing-hero'>
        <div className='listing-hero__grid' aria-hidden='true' />
        <div className='shell listing-hero__content'>
          <p className='eyebrow light'>
            <span /> Selected projects
          </p>
          <h1>
            Implementasi yang memberi <em>dampak nyata.</em>
          </h1>
          <p>
            Case study menjadi bukti bagaimana kebutuhan bisnis diterjemahkan
            menjadi arsitektur dan implementasi teknologi yang terukur.
          </p>
        </div>
      </section>

      <section className='projects section' id='proyek-list'>
        <div className='shell'>
          {projects.length > 0 ? (
            <div className='project-grid project-grid--listing'>
              {projects.map((project, index) => (
                <Link
                  className={`project-card${index === 0 ? ' featured' : ''}`}
                  href={`/proyek/${project.slug}`}
                  key={project.slug}
                >
                  <div className='project-card__visual'>
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes='(max-width: 820px) 100vw, 50vw'
                      />
                    ) : (
                      <span>0{index + 1}</span>
                    )}
                    <div className='project-card__shade' />
                    <p>{project.industry}</p>
                  </div>
                  <div className='project-card__content'>
                    <span>{project.client || 'Confidential client'}</span>
                    <h2>{project.title}</h2>
                    <p>{project.summary}</p>
                    {project.highlights.length > 0 ? (
                      <ul>
                        {project.highlights.map((highlight) => (
                          <li key={highlight}>
                            <Check size={13} /> {highlight}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <strong className='card-text-link'>
                      Lihat case study <ArrowUpRight size={16} />
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className='empty-content-state'>
              <span>Case study sedang disiapkan</span>
              <h2>
                Konten proyek akan tampil setelah dipublikasikan melalui CMS.
              </h2>
              <p>
                Struktur halaman sudah siap untuk tantangan, solusi, teknologi,
                dan hasil implementasi tanpa menampilkan klaim yang belum
                terverifikasi.
              </p>
              <Link className='button button-primary' href='/#kontak'>
                Diskusikan kebutuhan <ArrowUpRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>
      <WhatsAppButton phone={settings.contact.phone} />
      <SiteFooter />
    </main>
  );
}
