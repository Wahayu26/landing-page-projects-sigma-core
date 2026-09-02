import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { process, values } from "@/content/site";
import { getLandingContent } from "@/lib/landing-content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLandingContent();
  return {
    title: settings.seo.title,
    description: settings.seo.description,
    openGraph: {
      title: settings.seo.title,
      description: settings.seo.description,
      type: "website",
      images: [{ url: "/og.png", width: 1731, height: 909, alt: "PT Sigma Core Solusindo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo.title,
      description: settings.seo.description,
      images: ["/og.png"],
    },
  };
}

export default async function Home() {
  const { insights, partners, projects, settings, solutions } = await getLandingContent();
  const partnerRows = [partners.slice(0, 10), partners.slice(10)];
  const phoneHref = `tel:${settings.contact.phone.replace(/[^+\d]/g, "")}`;

  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <Image
          src="/assets/connected-city.jpg"
          alt="Kota digital yang saling terhubung"
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-content shell">
          <div className="hero-copy reveal">
            <p className="eyebrow light">
              <span /> {settings.hero.eyebrow}
            </p>
            <h1>
              {settings.hero.headline}
              <br />
              <em>{settings.hero.highlight}</em>
            </h1>
            <p className="hero-lead">{settings.hero.description}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="#kontak">
                Diskusikan kebutuhan <ArrowUpRight size={18} />
              </Link>
              <Link className="button button-ghost" href="#solusi">
                Jelajahi solusi <ArrowDown size={18} />
              </Link>
            </div>
          </div>

          <div className="hero-proof" aria-label="Nilai utama perusahaan">
            <span>Reliable</span>
            <span>Secure</span>
            <span>Scalable</span>
            <span>Customer-focused</span>
          </div>
        </div>
      </section>

      <section className="about section" id="tentang">
        <div className="shell about-grid">
          <div>
            <p className="eyebrow"><span /> Who we are</p>
            <h2 className="section-title">
              Lebih dari sekadar
              <br />
              <em>technology vendor.</em>
            </h2>
          </div>
          <div className="about-copy">
            <p>
              PT Sigma Core Solusindo membantu perusahaan membangun fondasi teknologi yang kuat
              dan berkelanjutan. Bukan hanya menyediakan produk, kami memastikan setiap komponen
              bekerja sebagai satu ekosistem yang utuh.
            </p>
            <div className="about-metrics">
              {settings.companyFacts.map((fact) => (
                <div key={`${fact.value}-${fact.label}`}><strong>{fact.value}</strong><span>{fact.label}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="solutions section" id="solusi">
        <div className="shell">
          <SectionHeading
            eyebrow="What we do"
            title="Solusi menyeluruh untuk setiap lapisan teknologi."
            description="Dari infrastruktur hingga keamanan, dari cloud hingga managed services—semua dirancang untuk bekerja bersama."
          />

          <div className="solution-grid">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <Link className="solution-card" href={`/solusi/${solution.slug}`} key={solution.title}>
                  <div className="solution-topline">
                    <span>{solution.number}</span>
                    <Icon size={26} strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3>{solution.title}</h3>
                    <p>{solution.description}</p>
                    <ul>
                      {solution.items.map((item) => (
                        <li key={item}><Check size={14} /> {item}</li>
                      ))}
                    </ul>
                  </div>
                  <ArrowUpRight className="card-arrow" size={20} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="integration" id="cara-kerja">
        <div className="integration-visual">
          <Image
            src="/assets/server-room.jpg"
            alt="Infrastruktur data center modern"
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
          />
          <div className="visual-label">
            <Sparkles size={18} />
            <span>End-to-end system integration</span>
          </div>
        </div>

        <div className="integration-content">
          <p className="eyebrow light"><span /> How we work</p>
          <h2 className="section-title light-title">Dari kebutuhan bisnis menuju sistem yang bekerja.</h2>
          <p className="integration-intro">
            Kami menyatukan beragam teknologi menjadi ekosistem yang seamless, optimal, dan mudah
            dikembangkan.
          </p>
          <div className="process-list">
            {process.map((item) => (
              <div className="process-item" key={item.step}>
                <span>{item.step}</span>
                <div><h3>{item.title}</h3><p>{item.text}</p></div>
                <ArrowRight size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="values section">
        <div className="shell">
          <SectionHeading
            eyebrow="Why SCS"
            title="Dibangun untuk menjadi partner, bukan sekadar penyedia."
            description="Setiap proyek dijalankan dengan kombinasi keahlian teknis, disiplin implementasi, dan pemahaman terhadap tujuan bisnis."
            rowClassName="mb-18"
          />

          <div className="value-grid">
            {values.map((value, index) => (
              <article key={value.title}>
                <span>0{index + 1}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="projects section" id="proyek">
          <div className="shell">
            <SectionHeading
              eyebrow="Selected projects"
              title="Implementasi yang memberi dampak nyata."
              description="Beberapa solusi yang kami rancang untuk menjawab kebutuhan operasional dan pertumbuhan bisnis."
              rowClassName="mb-14"
            />
            <div className="project-grid">
              {projects.map((project, index) => (
                <Link className={`project-card${index === 0 ? " featured" : ""}`} href={`/proyek/${project.slug}`} key={project.title}>
                  <div className="project-card__visual">
                    {project.image ? <Image src={project.image} alt={project.title} fill sizes="(max-width: 820px) 100vw, 50vw" /> : <span>0{index + 1}</span>}
                    <div className="project-card__shade" />
                    <p>{project.industry}</p>
                  </div>
                  <div className="project-card__content">
                    <span>{project.client || "Confidential client"}</span>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    {project.highlights.length > 0 && <ul>{project.highlights.map((highlight) => <li key={highlight}><Check size={13} /> {highlight}</li>)}</ul>}
                  </div>
                </Link>
              ))}
            </div>
            <Link className="section-link" href="/proyek">Lihat seluruh proyek <ArrowUpRight size={17} /></Link>
          </div>
        </section>
      )}

      <section className="ecosystem section" id="ekosistem">
        <div className="shell ecosystem-heading">
          <p className="eyebrow light"><span /> Technology ecosystem</p>
          <h2 className="section-title light-title">Bekerja dengan teknologi terdepan.</h2>
          <p>Kami merancang solusi menggunakan ekosistem teknologi enterprise yang sudah teruji.</p>
        </div>
        <div className="partner-marquee" aria-label="Daftar mitra teknologi">
          {partnerRows.map((row, rowIndex) => (
            <div className={`partner-track${rowIndex === 1 ? " reverse" : ""}`} key={rowIndex}>
              {[...row, ...row].map((partner, index) => (
                <div className="partner-logo" key={`${partner.name}-${index}`}>
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    width={460}
                    height={144}
                    sizes="(max-width: 580px) 190px, 240px"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {insights.length > 0 && (
        <section className="insights section" id="insight">
          <div className="shell">
            <SectionHeading
              eyebrow="Latest insight"
              title="Perspektif untuk keputusan teknologi yang lebih baik."
              description="Insight terbaru dari tim SCS seputar infrastruktur, keamanan, cloud, dan transformasi digital."
              rowClassName="mb-14"
            />
            <div className="insight-grid">
              {insights.map((insight, index) => (
                <Link className="insight-card" href={`/insight/${insight.slug}`} key={insight.title}>
                  <div className="insight-card__visual">
                    {insight.image ? <Image src={insight.image} alt={insight.title} fill sizes="(max-width: 580px) 100vw, 33vw" /> : <span>INSIGHT / 0{index + 1}</span>}
                  </div>
                  <div className="insight-card__content">
                    <div><span>{insight.category}</span><time dateTime={insight.publishedAt}>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(insight.publishedAt))}</time></div>
                    <h3>{insight.title}</h3>
                    <p>{insight.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link className="section-link" href="/insight">Baca seluruh insight <ArrowUpRight size={17} /></Link>
          </div>
        </section>
      )}

      <section className="contact section" id="kontak">
        <div className="shell contact-card">
          <div className="contact-copy">
            <p className="eyebrow light"><span /> Let&apos;s build what&apos;s next</p>
            <h2>Siap membangun fondasi teknologi berikutnya?</h2>
            <p>
              Ceritakan kebutuhan infrastruktur dan sistem Anda. Tim kami siap membantu menyusun
              solusi yang tepat.
            </p>
            <div className="contact-details">
              <a href={`mailto:${settings.contact.email}`}><Mail size={20} /> {settings.contact.email}</a>
              <a href={phoneHref}><Phone size={20} /> {settings.contact.phone}</a>
              <p><MapPin size={20} /> {settings.contact.address}</p>
            </div>
          </div>
          <ContactForm solutions={solutions.map((solution) => ({ slug: solution.slug, title: solution.title }))} sourcePage="homepage" />
        </div>
      </section>

      <WhatsAppButton phone={settings.contact.phone} />

      <SiteFooter />
    </main>
  );
}
